# mia-kelisap-api

FastAPI backend for Mia Kelisap — the core API handling auth, LLM orchestration, memory storage, message debouncing, and contact access control.

## Tech Stack

- **Python 3.11** / **FastAPI** — async web framework
- **SQLAlchemy 2.0** (async) + **asyncpg** — PostgreSQL ORM
- **Alembic** — database migrations
- **ChromaDB** — vector database for semantic memory
- **OpenAI / Anthropic SDK** — LLM providers
- **bcrypt** — password hashing
- **Fernet** — symmetric encryption for API keys at rest
- **uv** — package manager
- **ruff** — linter + formatter
- **pytest** — testing

## Project Structure

```
src/mia_kelisap/
├── main.py                 # FastAPI app factory + lifespan (starts debounce manager)
├── config.py               # Pydantic Settings (loaded from .env)
├── database.py             # Async SQLAlchemy engine + session
├── dependencies.py         # FastAPI DI — CurrentUser, DB
├── api/
│   ├── router.py           # Aggregates all route modules
│   ├── auth/               # POST /auth/signup, /auth/login, GET /auth/me
│   ├── conversations/      # GET /conversations, GET /conversations/:id
│   ├── messages/            # POST /messages/incoming (from bridge), GET /messages
│   ├── memory/             # GET /memory, POST /memory/search, DELETE /memory/:id
│   ├── settings/           # GET/PUT /settings (LLM keys, persona, reply style, access mode)
│   ├── contacts/           # GET/POST/DELETE /contacts (allowlist/blocklist rules)
│   ├── whatsapp/           # POST /whatsapp/connect, /disconnect, GET /whatsapp/status
│   └── analytics/          # GET /analytics/overview
├── models/
│   ├── base.py             # DeclarativeBase + UUIDMixin + TimestampMixin
│   ├── user.py             # User (email, password, name)
│   ├── user_settings.py    # UserSettings (LLM config, persona, reply style, access mode)
│   ├── conversation.py     # Conversation (user_id, contact_jid, contact_name)
│   ├── message.py          # Message (content, role, is_pending, is_stored_in_memory)
│   ├── contact_rule.py     # ContactRule (contact_jid, rule_type: allow/block)
│   └── whatsapp_session.py # WhatsAppSession (status, session_data)
├── services/
│   ├── debounce.py         # DebounceManager — polls pending messages, checks contact access, builds persona-aware prompt, calls LLM
│   ├── llm.py              # LLMService — OpenAI + Claude abstraction
│   ├── memory.py           # MemoryService — ChromaDB per-user collections
│   └── filter.py           # FilterService — sensitive info detection (credit cards, passwords, API keys)
└── core/
    ├── security.py         # JWT tokens + bcrypt password hashing
    └── encryption.py       # Fernet encrypt/decrypt for API keys
```

## API Endpoints

All protected endpoints require `Authorization: Bearer <jwt>` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/signup` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login, get JWT |
| GET | `/api/v1/auth/me` | Yes | Current user |
| GET | `/api/v1/conversations` | Yes | List conversations |
| GET | `/api/v1/conversations/:id` | Yes | Get conversation |
| GET | `/api/v1/messages?conversation_id=` | Yes | List messages |
| POST | `/api/v1/messages/incoming` | Bridge | Incoming WhatsApp message |
| GET | `/api/v1/memory` | Yes | List memories |
| POST | `/api/v1/memory/search` | Yes | Semantic search |
| DELETE | `/api/v1/memory/:id` | Yes | Delete memory |
| GET | `/api/v1/settings` | Yes | Get settings |
| PUT | `/api/v1/settings` | Yes | Update settings |
| GET | `/api/v1/contacts` | Yes | List contact rules |
| POST | `/api/v1/contacts` | Yes | Create contact rule |
| DELETE | `/api/v1/contacts/:id` | Yes | Delete contact rule |
| POST | `/api/v1/whatsapp/connect` | Yes | Connect WhatsApp |
| POST | `/api/v1/whatsapp/disconnect` | Yes | Disconnect |
| GET | `/api/v1/whatsapp/status` | Yes | Connection status |
| GET | `/api/v1/analytics/overview` | Yes | Stats overview |

## Setup

```bash
# Install dependencies
uv sync --dev

# Create .env from template
cp .env.example .env
# Edit .env with your secrets

# Create database
createdb mia_kelisap

# Generate and run migration
uv run alembic revision --autogenerate -m "initial"
uv run alembic upgrade head

# Start ChromaDB
docker compose up -d

# Run server
uv run uvicorn mia_kelisap.main:app --host 0.0.0.0 --port 5172 --reload
```

API docs at http://localhost:5172/docs

## Development

```bash
# Lint
uv run ruff check src/

# Format
uv run ruff format src/

# Run tests
uv run pytest tests/unit/ -v

# Generate new migration after model changes
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

## How the Debounce Flow Works

1. Bridge sends incoming WhatsApp message to `POST /messages/incoming`
2. Message stored with `is_pending=True`
3. `DebounceManager` polls every 10s for conversations with pending messages
4. If `elapsed_time >= debounce_seconds` (default 90s):
   - Check contact access control (allowlist/blocklist) — skip LLM if blocked
   - Aggregate all pending messages
   - Search ChromaDB for relevant memories
   - Build persona-aware system prompt (name, tone, reply style directives)
   - Call LLM (OpenAI or Claude)
   - Store reply + non-sensitive messages in memory
   - Send reply back via bridge

## Adding a New API Module

Follow the existing pattern:

1. Create `src/mia_kelisap/api/yourmodule/` with `__init__.py`, `schemas.py`, `service.py`, `router.py`
2. Register in `src/mia_kelisap/api/router.py`
3. Use `CurrentUser` and `DB` from `dependencies.py` for auth + database access
4. Use `ConfigDict(from_attributes=True)` for Pydantic response models that map from SQLAlchemy
