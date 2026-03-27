<div align="center">

<pre>
 ███╗   ███╗██╗ █████╗     ██╗  ██╗███████╗██╗     ██╗███████╗ █████╗ ██████╗
 ████╗ ████║██║██╔══██╗    ██║ ██╔╝██╔════╝██║     ██║██╔════╝██╔══██╗██╔══██╗
 ██╔████╔██║██║███████║    █████╔╝ █████╗  ██║     ██║███████╗███████║██████╔╝
 ██║╚██╔╝██║██║██╔══██║    ██╔═██╗ ██╔══╝  ██║     ██║╚════██║██╔══██║██╔═══╝
 ██║ ╚═╝ ██║██║██║  ██║    ██║  ██╗███████╗███████╗██║███████║██║  ██║██║
 ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝
</pre>

**Your AI-powered WhatsApp companion with persistent memory.**

Mia Kelisap connects to your WhatsApp, learns from your conversations,<br/>
and replies to messages on your behalf — naturally, like a real person.

[Getting Started](#-quick-start) &#8226; [Features](#-features) &#8226; [Architecture](#-architecture) &#8226; [Development](#-development)

</div>

---

## What is Mia Kelisap?

Mia Kelisap is a self-hosted AI companion that manages your WhatsApp conversations. It connects as a linked device to your WhatsApp account, listens for incoming messages, and responds intelligently using OpenAI or Claude — with full context from past conversations stored in a vector database.

Think of it as a personal AI secretary that:

- Waits for people to finish typing (smart debounce) before replying
- Remembers past conversations and uses them for context
- Speaks in your preferred tone and style
- Knows when to stay quiet (groups: only replies when @mentioned)
- Protects your privacy (never leaks personal details to strangers)
- Blocks scammers from wasting your LLM tokens

You bring your own LLM API key. Your data stays on your machine.

## Features

| Feature | Description |
|---------|-------------|
| **Smart debounce** | Waits 5-300s of silence before replying, so people can send multiple messages |
| **Vector memory** | ChromaDB stores conversation context per user for semantic retrieval |
| **AI persona** | Name your agent, set its tone, give custom behavior instructions |
| **Reply style control** | Control response length, markdown formatting, language simplicity |
| **Contact access control** | Allowlist/blocklist contacts to prevent token waste from scammers |
| **Group chat awareness** | Only replies when @mentioned or replied to — never to random messages |
| **Hard privacy rules** | AI never reveals personal details, passwords, financial info to anyone |
| **Encrypted API keys** | Your OpenAI/Claude keys are encrypted at rest with Fernet |
| **Multi-user support** | Each user gets isolated memory, WhatsApp session, and settings |
| **Session persistence** | WhatsApp stays connected across server restarts — no re-scanning QR |
| **Model selection** | Choose between GPT-4o, GPT-3.5, Claude Sonnet, Claude Haiku, and more |
| **Onboarding guide** | Step-by-step setup wizard on the dashboard |

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              mia-kelisap (monorepo)          │
                    │                                              │
 ┌──────────┐      │  ┌────────────┐     ┌─────────────────────┐  │
 │ WhatsApp │◄────►│  │   Bridge   │────►│       API           │  │
 │  Users   │      │  │  :5174     │◄────│      :5172          │  │
 └──────────┘      │  │            │     │                     │  │
                    │  │ Baileys    │     │ FastAPI             │  │
                    │  │ Express    │     │ SQLAlchemy          │  │
                    │  │ TypeScript │     │ Debounce Manager    │  │
                    │  └────────────┘     │ LLM Service         │  │
                    │                     │ Memory Service       │  │
                    │  ┌────────────┐     └──────────┬──────────┘  │
                    │  │    Web     │                │              │
                    │  │   :5173   │     ┌──────────┴──────────┐  │
                    │  │            │     │   PostgreSQL :5432  │  │
                    │  │ React 19   │     │   ChromaDB   :8000  │  │
                    │  │ Tailwind   │     └─────────────────────┘  │
                    │  │ shadcn/ui  │                               │
                    │  └────────────┘                               │
                    └──────────────────────────────────────────────┘
```

| Service | Tech | Port |
|---------|------|------|
| **mia-kelisap-api** | Python, FastAPI, SQLAlchemy, Alembic | 5172 |
| **mia-kelisap-bridge** | Node.js, TypeScript, Baileys, Express | 5174 |
| **mia-kelisap-web** | React 19, Vite, Tailwind v4, shadcn/ui | 5173 |
| **PostgreSQL** | Relational database | 5432 |
| **ChromaDB** | Vector database (Docker) | 8000 |

## How It Works

```
Someone sends you a WhatsApp message
        │
        ▼
   Bridge receives it via Baileys WebSocket
        │
        ├── Group? Only process if you're @mentioned
        ├── Blocked? Skip if contact is blocklisted
        │
        ▼
   API stores message with is_pending=true
        │
        ▼
   Debounce manager waits for silence...
        │  (no new messages for N seconds)
        │
        ▼
   When ready:
        ├── Fetch last 20 messages as conversation history
        ├── Search vector memory for relevant context
        ├── Build persona-aware system prompt
        ├── Call OpenAI or Claude (your API key, your model choice)
        │
        ▼
   Reply sent back through WhatsApp
   Memory updated in ChromaDB
```

## Quick Start

### Prerequisites

- **Python 3.11+** (via asdf: `asdf install python 3.11.1`)
- **Node.js 20+** (via asdf: `asdf install nodejs 24.0.1`)
- **uv** — Python package manager (`brew install uv`)
- **PostgreSQL** — running locally (`brew services start postgresql`)
- **Docker** — for ChromaDB

### 1. Clone and setup

```bash
git clone git@github.com:syamsulmj/mia-kelisap.git
cd mia-kelisap

# One command setup — installs deps, creates .env, sets up DB, starts ChromaDB
./scripts/setup.sh
```

### 2. Start everything

```bash
./scripts/dev.sh
```

That's it. Three services start with hot-reload:

| | URL |
|---|---|
| Dashboard | http://localhost:5173 |
| API Docs | http://localhost:5172/docs |
| Bridge Health | http://localhost:5174/health |

### 3. Connect WhatsApp

1. Open http://localhost:5173 and create an account
2. Add your OpenAI or Claude API key in **Settings**
3. Click **Connect WhatsApp** and scan the QR code
4. Send a test message from another phone

## Manual Setup

<details>
<summary>Click to expand step-by-step instructions</summary>

### Database

```bash
createdb mia_kelisap
cd mia-kelisap-api
uv run alembic revision --autogenerate -m "initial"
uv run alembic upgrade head
```

### ChromaDB

```bash
docker compose up -d
```

### Environment Variables

```bash
cp mia-kelisap-api/.env.example mia-kelisap-api/.env
cp mia-kelisap-bridge/.env.example mia-kelisap-bridge/.env
cp mia-kelisap-web/.env.example mia-kelisap-web/.env
```

**mia-kelisap-api/.env**
```env
DATABASE_URL=postgresql+asyncpg://localhost:5432/mia_kelisap
CHROMA_HOST=localhost
CHROMA_PORT=8000
JWT_SECRET=<openssl rand -hex 32>
ENCRYPTION_KEY=<python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
BRIDGE_URL=http://localhost:5174
BRIDGE_SECRET=<openssl rand -hex 32>
DEBOUNCE_DEFAULT_SECONDS=90
```

**mia-kelisap-bridge/.env**
```env
PORT=5174
API_URL=http://localhost:5172
BRIDGE_SECRET=<same as API's BRIDGE_SECRET>
SESSIONS_DIR=./sessions
LOG_LEVEL=info
```

**mia-kelisap-web/.env**
```env
VITE_API_URL=http://localhost:5172
```

### Install Dependencies

```bash
cd mia-kelisap-api && uv sync --dev
cd mia-kelisap-bridge && npm install
cd mia-kelisap-web && npm install
```

### Start Individually

```bash
# Terminal 1
cd mia-kelisap-api && uv run uvicorn mia_kelisap.main:app --port 5172 --reload

# Terminal 2
cd mia-kelisap-bridge && npm run dev

# Terminal 3
cd mia-kelisap-web && npm run dev
```

</details>

## Development

### Code Quality

```bash
# API
cd mia-kelisap-api
uv run ruff check src/        # lint
uv run ruff format src/       # format
uv run pytest tests/unit/ -v  # tests

# Bridge
cd mia-kelisap-bridge
npm run typecheck              # tsc --noEmit
npm run lint                   # eslint

# Web
cd mia-kelisap-web
npx tsc --noEmit               # type-check
npx vite build                 # production build
```

### Database Migrations

```bash
cd mia-kelisap-api
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

## Project Structure

```
mia-kelisap/
├── scripts/
│   ├── setup.sh                # One-time setup
│   └── dev.sh                  # Start all services
├── docs/                       # PRDs and technical docs
├── mia-kelisap-api/            # FastAPI backend
│   ├── src/mia_kelisap/
│   │   ├── api/                # Route modules
│   │   ├── models/             # SQLAlchemy models
│   │   ├── services/           # Debounce, LLM, Memory, Filter
│   │   └── core/               # Security, Encryption
│   ├── alembic/                # Migrations
│   └── tests/
├── mia-kelisap-bridge/         # WhatsApp bridge
│   └── src/
│       ├── services/           # Baileys, Session Manager
│       └── routes/             # REST endpoints
└── mia-kelisap-web/            # React dashboard
    └── src/
        ├── components/         # shadcn/ui + custom
        ├── pages/              # Dashboard, Conversations, Memory, Settings
        ├── hooks/              # TanStack Query
        └── api/                # Axios client
```

## Tech Stack

| | Technology |
|---|---|
| **API** | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16, ChromaDB |
| **LLM** | OpenAI SDK, Anthropic SDK |
| **Bridge** | Node.js, TypeScript, Baileys, Express |
| **Frontend** | React 19, Vite, Tailwind v4, shadcn/ui, TanStack Query, Zustand |
| **Auth** | JWT, bcrypt, Fernet encryption |
| **Testing** | pytest, vitest, Playwright |
| **Linting** | ruff, ESLint, Prettier |

## License

Private project. Not open source.

---

<div align="center">
<sub>Built with FastAPI, React, Baileys, and a lot of coffee.</sub>
</div>
