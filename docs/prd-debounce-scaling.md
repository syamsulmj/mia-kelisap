# PRD: Debounce System Scaling

## Status: Future — reference for when scaling becomes necessary

## Context

The debounce system is the core message processing pipeline. When a WhatsApp message arrives, it's stored as `is_pending=True` and a background poller picks it up after the debounce window (default 90s of silence). This works but has scaling limitations.

### Current Architecture (Level 0)

```
Message arrives → stored in PostgreSQL (is_pending=True)
                                    ↓
        Global poller (every 10s) scans ALL pending messages
                                    ↓
        For each ready conversation: LLM call → reply → send via bridge
```

**Limitations:**
- Poller queries all users every 10s regardless of activity
- Full table scan on `messages.is_pending` column
- Database write for every pending state change
- Single-threaded poller processes conversations sequentially
- No way to distribute across multiple workers

## Scaling Levels

### Level 1: Indexed Query Optimization

**When to implement:** 50-100 users, query starts taking >100ms

**Changes:**
- Add composite index on `messages(is_pending, conversation_id)` and `messages(conversation_id, created_at)`
- Add index on `conversations(user_id, updated_at)`

**Migration:**
```sql
CREATE INDEX ix_messages_pending_conv ON messages (is_pending, conversation_id) WHERE is_pending = true;
CREATE INDEX ix_messages_conv_created ON messages (conversation_id, created_at);
```

**Impact:** Query goes from full table scan to index-only scan on pending messages. Handles ~500 active users comfortably.

**Effort:** 1 migration file, no code changes.

---

### Level 2: In-Memory Active User Tracking

**When to implement:** 100-500 users, most users idle at any given time

**Changes:**
- Add an in-memory `Set[str]` of user IDs with pending messages
- When `/messages/incoming` is called, add `user_id` to the set
- Poller only checks users in the set instead of querying all conversations
- After processing, remove user from the set

**Architecture:**
```
Message arrives → stored in PostgreSQL
               → user_id added to active_users set (in-memory)
                                    ↓
        Poller iterates only active_users set
                                    ↓
        For each active user: check debounce → process → remove from set
```

**Code changes:**
- `DebounceManager` gets an `active_users: set[str]` attribute
- New method `notify_pending(user_id: str)` called from message incoming handler
- `_check_ready_conversations` only queries conversations for users in the set
- After processing, `user_id` is removed from the set

**Impact:** Poller skips all idle users. If 500 users exist but only 10 have active conversations, only 10 DB queries run per poll cycle.

**Effort:** ~30 lines of code changes, no infrastructure changes.

**Limitation:** In-memory set is lost on restart. On startup, fall back to the current full-scan approach once to rebuild the set from any pending messages in DB.

---

### Level 3: Event-Driven with Redis Task Queue

**When to implement:** 500-10,000 users, need per-conversation timers and horizontal scaling

**Why Redis:**
- Delayed tasks are naturally lightweight in Redis (sorted sets with score = fire time)
- No polling at all — each conversation has its own timer
- Messages can be accumulated in Redis during the debounce window, avoiding DB writes for the pending state
- Redis is ephemeral by design — perfect for transient debounce state
- Enables horizontal scaling with multiple worker processes

**Architecture:**
```
Message arrives
    ├→ stored in PostgreSQL (no is_pending flag needed)
    ├→ message content appended to Redis list: debounce:{user_id}:{conv_id}:messages
    └→ debounce timer reset in Redis sorted set:
         ZADD debounce:timers {fire_time} {user_id}:{conv_id}

Worker loop (replaces poller):
    ZRANGEBYSCORE debounce:timers -inf {now}
    For each ready conversation:
        1. LRANGE debounce:{user_id}:{conv_id}:messages 0 -1  (get accumulated messages)
        2. Build LLM context from Redis buffer + DB history
        3. Call LLM
        4. Store reply in DB
        5. Send via bridge
        6. DEL debounce:{user_id}:{conv_id}:messages  (clear buffer)
        7. ZREM debounce:timers {user_id}:{conv_id}  (remove timer)
```

**Message accumulation in Redis:**
Instead of marking messages as `is_pending` in PostgreSQL, accumulate them in a Redis list during the debounce window:
```
RPUSH debounce:{user_id}:{conv_id}:messages '{"content":"hello","sender":"Alya","timestamp":"..."}'
```
This is faster than DB writes and naturally groups messages for the LLM context.

**Timer management:**
```
# When message arrives, reset the debounce timer
fire_time = now + user.debounce_seconds
ZADD debounce:timers {fire_time} "{user_id}:{conv_id}"
```
If a new message arrives before the timer fires, the ZADD updates the score (resets the timer). No need to cancel/reschedule — the sorted set handles it naturally.

**Worker loop:**
```python
async def worker_loop():
    while True:
        now = time.time()
        ready = await redis.zrangebyscore("debounce:timers", "-inf", str(now))
        for key in ready:
            user_id, conv_id = key.split(":")
            messages = await redis.lrange(f"debounce:{key}:messages", 0, -1)
            await process_conversation(user_id, conv_id, messages)
            await redis.delete(f"debounce:{key}:messages")
            await redis.zrem("debounce:timers", key)
        await asyncio.sleep(1)  # Check every second, very lightweight
```

**Infrastructure requirements:**
- Redis instance (Docker: `redis:7-alpine`, ~5MB RAM for 10K conversations)
- Add `redis` to Python dependencies (`redis[hiredis]>=5.0`)

**Docker Compose addition:**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

**Code changes:**
- New `RedisDebounceManager` class replacing `DebounceManager`
- `/messages/incoming` handler pushes to Redis instead of setting `is_pending`
- `is_pending` column becomes unused (can be removed in a later migration)
- Worker loop checks Redis sorted set every 1s instead of PostgreSQL every 10s

**Benefits over Level 2:**
- Per-conversation timers (not per-user) — more granular
- Message accumulation avoids DB writes during debounce window
- Multiple workers can process the queue (horizontal scaling)
- 1s check interval (vs 10s polling) — faster response times
- No state loss on restart — Redis persists the sorted set

**Effort:** New Redis service, rewrite debounce manager (~200 lines), update docker-compose and setup scripts.

---

### Level 4: Horizontal Scaling

**When to implement:** 10,000+ concurrent users, single server can't handle the load

**Architecture:**
```
                    Load Balancer
                    ┌────┴────┐
              API Instance 1   API Instance 2
                    │              │
              ┌─────┴──────────────┴─────┐
              │         Redis Cluster     │
              │  (debounce timers/queues) │
              └─────┬──────────────┬─────┘
              Worker 1        Worker 2        Worker N
                    │              │              │
              ┌─────┴──────────────┴──────────────┴─────┐
              │          PostgreSQL (primary)            │
              │          PostgreSQL (read replicas)      │
              └─────────────────────────────────────────┘

Bridge Cluster:
              Bridge Instance 1 (users A-M)
              Bridge Instance 2 (users N-Z)
              (partitioned by user ID hash)
```

**Changes:**

1. **API horizontal scaling:**
   - Stateless API servers behind a load balancer
   - Session/auth via JWT (already stateless)
   - Redis for shared state (debounce timers)

2. **Bridge partitioning:**
   - Each bridge instance handles a subset of users
   - Partition by user ID hash: `user_id.hashCode() % num_instances`
   - Kubernetes StatefulSet or manual partition assignment
   - Each instance manages its own Baileys sessions

3. **Worker pool:**
   - Debounce workers as separate processes
   - Pull from Redis queue, process, push replies
   - Auto-scale based on queue depth
   - Worker locking via Redis `SETNX` to prevent double-processing

4. **Database scaling:**
   - PostgreSQL read replicas for conversation/message queries
   - Write primary for message storage
   - Connection pooling via PgBouncer

5. **Vector DB scaling:**
   - Replace ChromaDB with managed service (Pinecone, Weaviate, Qdrant Cloud)
   - Or self-hosted Qdrant/Milvus cluster

6. **Monitoring:**
   - Queue depth metrics (Redis `ZCARD debounce:timers`)
   - LLM latency per provider
   - Messages processed per minute
   - Error rates per worker
   - Bridge connection health per user

**Infrastructure:**
- Kubernetes or Docker Swarm for orchestration
- Redis Cluster (3 nodes minimum for HA)
- PostgreSQL with streaming replication
- Managed vector DB
- Prometheus + Grafana for monitoring
- Application load balancer (nginx/Caddy/cloud ALB)

**Effort:** Major infrastructure project. Estimated 2-4 weeks for a small team.

---

## Recommended Path

| Users | Level | Key Change | Effort |
|-------|-------|-----------|--------|
| 1-100 | 1 | Add DB indexes | 1 hour |
| 100-500 | 2 | In-memory active user tracking | 1 day |
| 500-10K | 3 | Redis event-driven debounce | 1 week |
| 10K+ | 4 | Full horizontal scaling | 2-4 weeks |

Start with Level 1 now (free performance), implement Level 2 when you notice idle polling overhead, and plan Level 3 when you're ready to go to production with real users.

## Open Questions

- **Message ordering guarantee:** At Level 3+, if multiple workers process conversations simultaneously, do we need to ensure message ordering? Redis lists (RPUSH/LRANGE) preserve insertion order, so this should be fine within a single conversation.
- **LLM rate limiting:** At scale, multiple conversations firing simultaneously could hit LLM API rate limits. Should we add a token bucket rate limiter per API key?
- **Cost alerting:** Should we add per-user token usage tracking and alerting when a user is approaching a cost threshold?
- **Bridge failover:** If a bridge instance crashes, how do we reassign its users to another instance? Need a health check + reassignment mechanism.
