# CLAUDE.md — Mia Kelisap Codebase Guide

## Project Overview

Mia Kelisap is an AI-powered WhatsApp companion that auto-replies to messages using LLM (OpenAI or Claude) with persistent vector memory. It stores conversation context in ChromaDB, learns about the owner over time, and responds naturally on their behalf.

The system is a **monorepo with three services**:

- **`mia-kelisap-api`** — FastAPI backend: auth, LLM orchestration, memory, debounce, contact access control
- **`mia-kelisap-bridge`** — Node.js WhatsApp bridge: Baileys WebSocket, session management, message forwarding
- **`mia-kelisap-web`** — React frontend: dashboard, settings, conversations, memory browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **API** | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16, ChromaDB (vector DB via Docker) |
| **LLM** | OpenAI SDK, Anthropic SDK (user brings their own keys) |
| **Auth** | JWT (python-jose), bcrypt password hashing, Fernet encryption for API keys |
| **Bridge** | Node.js 24, TypeScript (strict), Express 5, @whiskeysockets/baileys 6.x |
| **Frontend** | React 19, Vite, Tailwind CSS v4, shadcn/ui (base-ui), TanStack Query, Zustand |
| **Testing** | pytest (API), vitest (bridge/web), Playwright (e2e) |
| **Linting** | ruff (Python), ESLint + Prettier (TypeScript) |
| **Package Mgmt** | uv (Python), npm (Node.js) |
| **Version Mgmt** | asdf with .tool-versions |

## Common Commands

```bash
# Start all services (API + Bridge + Web + ChromaDB)
./scripts/dev.sh

# First-time setup (creates .env files, installs deps, sets up DB)
./scripts/setup.sh

# === API (from mia-kelisap-api/) ===
uv run uvicorn mia_kelisap.main:app --host 0.0.0.0 --port 5172 --reload
uv run ruff check src/              # lint
uv run ruff format src/             # format
uv run pytest tests/unit/ -v        # unit tests
uv run alembic revision --autogenerate -m "describe change"  # new migration
uv run alembic upgrade head         # apply migrations

# === Bridge (from mia-kelisap-bridge/) ===
npm run dev                         # start with hot-reload
npm run typecheck                   # tsc --noEmit
npm run lint                        # eslint
npm test                            # vitest

# === Web (from mia-kelisap-web/) ===
npm run dev                         # vite dev server
npx tsc --noEmit                    # type-check
npx vite build                      # production build
```

## Service Ports

| Service | Port |
|---------|------|
| API (FastAPI) | 5172 |
| Web (Vite) | 5173 |
| Bridge (Express) | 5174 |
| ChromaDB (Docker) | 8000 |
| PostgreSQL | 5432 |

## Project Structure

```
mia-kelisap/
├── CLAUDE.md                       # This file
├── README.md                       # Project overview + setup guide
├── docker-compose.yml              # ChromaDB
├── scripts/
│   ├── setup.sh                    # One-time setup
│   └── dev.sh                      # Start all services
├── docs/
│   └── prd-debounce-scaling.md     # Scaling roadmap (Level 1-4)
│
├── mia-kelisap-api/                # ── FastAPI Backend ──
│   ├── src/mia_kelisap/
│   │   ├── main.py                 # App factory + lifespan (starts debounce)
│   │   ├── config.py               # Pydantic Settings from .env
│   │   ├── database.py             # Async SQLAlchemy engine + session
│   │   ├── dependencies.py         # FastAPI DI: CurrentUser, DB
│   │   ├── api/
│   │   │   ├── router.py           # Aggregates all route modules
│   │   │   ├── auth/               # signup, login, me
│   │   │   ├── conversations/      # list, get by id
│   │   │   ├── messages/           # incoming (from bridge), list
│   │   │   ├── memory/             # list, semantic search, delete
│   │   │   ├── settings/           # get/put user settings
│   │   │   ├── contacts/           # allowlist/blocklist CRUD
│   │   │   ├── whatsapp/           # connect, disconnect, status, bridge-status
│   │   │   └── analytics/          # overview stats
│   │   ├── models/
│   │   │   ├── base.py             # DeclarativeBase + UUIDMixin + TimestampMixin
│   │   │   ├── user.py
│   │   │   ├── user_settings.py    # LLM config, persona, reply style, access mode
│   │   │   ├── conversation.py     # contact_jid, is_group
│   │   │   ├── message.py          # content, role, is_pending, is_stored_in_memory
│   │   │   ├── contact_rule.py     # allowlist/blocklist rules
│   │   │   └── whatsapp_session.py
│   │   ├── services/
│   │   │   ├── debounce.py         # ★ Core: polls pending msgs, builds prompt, calls LLM, sends reply
│   │   │   ├── llm.py              # OpenAI + Claude abstraction
│   │   │   ├── memory.py           # ChromaDB per-user collections
│   │   │   └── filter.py           # Sensitive info detection
│   │   └── core/
│   │       ├── security.py         # JWT + bcrypt
│   │       └── encryption.py       # Fernet for API keys at rest
│   ├── alembic/                    # Database migrations
│   ├── tests/
│   └── pyproject.toml              # uv project + ruff/mypy/pytest config
│
├── mia-kelisap-bridge/             # ── Node.js WhatsApp Bridge ──
│   ├── src/
│   │   ├── index.ts                # Express server + session restore on startup
│   │   ├── config.ts               # Zod-validated env
│   │   ├── types.ts                # Shared interfaces
│   │   ├── services/
│   │   │   ├── whatsapp.service.ts # ★ Baileys socket, QR, reconnect, mention detection
│   │   │   ├── session-manager.ts  # Map<userId, WhatsAppService>, restore on startup
│   │   │   └── api-client.ts       # HTTP to FastAPI
│   │   ├── routes/                 # session + message endpoints
│   │   ├── middleware/             # shared-secret auth, error handler
│   │   └── utils/                  # pino logger, retry
│   ├── sessions/                   # Baileys auth files (gitignored)
│   └── package.json
│
└── mia-kelisap-web/                # ── React Frontend ──
    ├── src/
    │   ├── App.tsx                 # QueryClientProvider + Router
    │   ├── router.tsx              # Path-based routing with auth guard
    │   ├── index.css               # Tailwind + shadcn theme + animations
    │   ├── api/                    # Axios client + endpoint functions
    │   ├── hooks/                  # TanStack Query hooks (one per domain)
    │   ├── stores/                 # Zustand auth store (JWT + user)
    │   ├── types/                  # TypeScript interfaces per domain
    │   ├── components/
    │   │   ├── ui/                 # shadcn + custom (pulse-dot, stat-card, dropdown-select)
    │   │   ├── layout/            # Sidebar, RootLayout, AuthLayout, PageHeader
    │   │   ├── auth/              # LoginForm, SignupForm
    │   │   ├── conversations/     # ConversationList, ConversationDetail, MessageBubble
    │   │   ├── memory/            # MemoryBrowser, MemoryCard, MemorySearch
    │   │   ├── whatsapp/          # QrScanner, ConnectionStatus
    │   │   ├── settings/          # AgentPersonaForm, ApiKeyForm, DebounceConfig, ContactAccessControl
    │   │   ├── analytics/         # StatsOverview
    │   │   └── dashboard/         # OnboardingGuide
    │   └── pages/                  # login, signup, dashboard, conversations, memory, settings, analytics
    └── package.json
```

## Architecture & Data Flow

### Message Flow (WhatsApp → AI Reply)

```
WhatsApp User sends message
    ↓
Baileys Bridge receives via WebSocket
    ├── Group? Check if bot @mentioned or replied to → skip if not
    ├── Filter: skip fromMe, status@broadcast
    ↓
POST /api/v1/messages/incoming → FastAPI API
    ├── Find or create Conversation (with is_group flag)
    ├── Store Message with is_pending=True
    ├── Notify DebounceManager (active_users set)
    ↓
DebounceManager polls every 10s (only active users)
    ├── Check: elapsed time >= debounce_seconds? → wait if not
    ├── Check: contact allowed? (allowlist/blocklist) → skip if blocked
    ├── Fetch conversation history (last 20 messages as user/assistant turns)
    ├── Search ChromaDB for relevant memories (10 results)
    ├── Search ChromaDB for owner context (5 results)
    ├── Build system prompt:
    │   0. Custom instructions (HIGHEST PRIORITY)
    │   1. Identity (name, owner, contact, group context)
    │   2. Personality (tone, human-like behavior rules)
    │   3. Owner knowledge (from memory)
    │   4. Security rules (HARD — never reveal personal data)
    │   5. Reply style (length, markdown, language, oversharing)
    │   6. Conversation memories
    ├── Call LLM (OpenAI or Claude, user's model choice)
    ├── Store reply + non-sensitive messages in ChromaDB
    ↓
POST /messages/send → Bridge → WhatsApp reply delivered
```

### Key Architectural Decisions

- **Debounce, not instant reply** — waits for silence (configurable 5-300s) before replying, so people can finish their thought across multiple messages
- **Per-user isolation** — each user has their own ChromaDB collection, WhatsApp session, API keys, and settings
- **Hard privacy boundaries** — group chats get a restricted prompt with no personal data; security rules are absolute and cannot be bypassed by prompt injection
- **getMessage callback** — Baileys requires this to handle message retries; we store messages in an in-memory Map for re-encryption when WhatsApp requests retransmission
- **Active user tracking (Level 2)** — debounce poller only queries users with known pending messages, not all users

## Core Service: debounce.py

This is the brain of the system (`mia-kelisap-api/src/mia_kelisap/services/debounce.py`). It:

1. Polls for pending messages (only for active users)
2. Checks debounce timing
3. Checks contact access control
4. Builds conversation history from DB (last 20 messages)
5. Searches vector memory (relevant + owner context)
6. Constructs a multi-section system prompt
7. Calls the LLM
8. Stores the reply
9. Sends via bridge to WhatsApp

**When modifying the AI's behavior**, this is the file to edit — specifically `_build_system_prompt()`.

## Core Service: whatsapp.service.ts

The Baileys integration (`mia-kelisap-bridge/src/services/whatsapp.service.ts`). Key behaviors:

- **Session restore** — on startup, scans `sessions/` for existing auth and auto-reconnects
- **Group mention detection** — 4 layers: mentionedJid (phone), mentionedJid (LID), quoted message reply, text fallback
- **contextInfo extraction** — checks ALL message types (text, image, video, document, audio, sticker)
- **getMessage callback** — in-memory store (500 messages) for WhatsApp retry handling
- **Health check** — every 60s checks WebSocket liveness, force-reconnects if stale
- **keepAliveIntervalMs: 30s** — prevents WhatsApp from dropping idle connections
- **intentionalDisconnect flag** — prevents auto-reconnect when user clicks Disconnect

## Adding a New API Module

Follow the existing pattern in `mia-kelisap-api/src/mia_kelisap/api/`:

1. Create `api/yourmodule/` with `__init__.py`, `schemas.py`, `service.py`, `router.py`
2. Register in `api/router.py`
3. Use `CurrentUser` and `DB` from `dependencies.py`
4. Use `ConfigDict(from_attributes=True)` for response models mapping from SQLAlchemy
5. Run `uv run alembic revision --autogenerate -m "..."` if you added models

## Adding a New Frontend Page

1. Create `src/pages/your-page.tsx` — use `RootLayout` + `PageHeader`
2. Add route in `src/router.tsx`
3. Add nav item in `src/components/layout/sidebar.tsx`
4. Add types in `src/types/`, API in `src/api/`, hook in `src/hooks/`

## Database Migrations

```bash
cd mia-kelisap-api

# After changing models:
uv run alembic revision --autogenerate -m "describe what changed"

# IMPORTANT: Check the generated migration!
# - Add server_default for new NOT NULL columns on existing tables
# - Verify it doesn't drop data

# Apply:
uv run alembic upgrade head
```

## Engineering Principles

### Plan Before You Build

1. **Trace the full flow** before writing code — from WhatsApp message arrival through debounce, LLM call, memory storage, and reply delivery. Understand what happens at each step and what can fail.
2. **Write a PRD for non-trivial features** — anything that touches multiple services or changes the prompt/LLM behavior. Put them in `docs/`.
3. **Read existing code** before proposing changes. The debounce service, system prompt, and Baileys integration have nuanced behavior that's easy to break.

### Data Integrity

4. **State changes at the right moment** — messages are `is_pending=True` until processed. Don't mark them as processed before the LLM reply is stored and sent.
5. **Never store sensitive data in memory** — the FilterService checks for credit cards, passwords, API keys before ChromaDB storage. Respect this boundary.
6. **Encrypt API keys at rest** — use Fernet encryption. Never log or expose decrypted keys.

### AI Behavior

7. **Custom instructions have highest priority** — they come FIRST in the system prompt so the LLM treats them as the primary directive.
8. **Security rules are absolute** — the HARD SECURITY section cannot be overridden by any prompt, conversation trick, or social engineering.
9. **Group chats get restricted context** — no personal data, no memories, just general helpful responses.
10. **Don't introduce yourself** — the prompt explicitly tells the AI not to say its name, not to greet robotically, and to match conversation energy.

### Code Quality

11. **Run checks after every change:**
    - API: `uv run ruff check src/ && uv run ruff format src/ && uv run pytest tests/unit/ -v`
    - Bridge: `npx tsc --noEmit`
    - Web: `npx tsc --noEmit && npx vite build`
12. **No dead code** — remove unused imports, functions, and commented-out code.
13. **Type everything** — Python uses type hints everywhere, TypeScript uses strict mode.
14. **Keep services thin** — API routes call services, services call models/external APIs. No business logic in routes.

### WhatsApp Integration

15. **Always provide getMessage** — Baileys needs this to handle retries. Without it, recipients see "Waiting for this message."
16. **Group messages require mention** — never reply to random group messages. Only respond when @mentioned or replied to.
17. **Session files are precious** — don't clear them unless explicitly disconnecting. They prevent re-QR-scanning on restart.
18. **Expect decryption errors on restart** — messages sent while the server was down can't be decrypted. This is normal Baileys behavior, not a bug.

## Commit Messages

Use imperative mood:
- `feat: add contact access control`
- `fix: prevent AI reply to unmentioned group messages`
- `refactor: extract system prompt builder`
- `docs: add scaling PRD`
