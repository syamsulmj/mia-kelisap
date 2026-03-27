# mia-kelisap-bridge

Node.js WhatsApp bridge service using Baileys. A thin relay between WhatsApp and the FastAPI backend — manages WhatsApp connections, forwards messages, and sends replies.

## Tech Stack

- **Node.js 24** / **TypeScript** (strict mode)
- **Express 5** — HTTP server
- **@whiskeysockets/baileys** — WhatsApp Web API (multi-device)
- **pino** — structured logging
- **qrcode** — QR code generation for WhatsApp pairing
- **zod** — runtime config validation
- **vitest** — testing
- **eslint + prettier** — linting/formatting

## Project Structure

```
src/
├── index.ts                    # Express server, graceful shutdown
├── config.ts                   # Zod-validated env config
├── types.ts                    # Shared TypeScript interfaces
├── routes/
│   ├── index.ts                # Route aggregator
│   ├── session.routes.ts       # POST/DELETE/GET /sessions/:userId — manage WhatsApp connections
│   └── message.routes.ts       # POST /messages/send — send message via WhatsApp
├── services/
│   ├── session-manager.ts      # Manages Map<userId, WhatsAppService> — one session per user
│   ├── whatsapp.service.ts     # Baileys socket — connection, QR, reconnect, message handling
│   └── api-client.ts           # HTTP client to forward messages to FastAPI backend
├── middleware/
│   ├── auth.ts                 # Shared-secret auth (bridge <-> API)
│   └── error-handler.ts        # Global error handler
└── utils/
    ├── logger.ts               # Pino structured logger
    └── retry.ts                # Retry utility with exponential backoff
```

## How It Works

```
WhatsApp User
    │
    ▼ (incoming message via Baileys WebSocket)
WhatsAppService
    │
    ▼ POST /api/v1/messages/incoming
FastAPI Backend
    │
    ▼ (after debounce, LLM generates reply)
Bridge receives send command
    │
    ▼ sock.sendMessage(jid, { text })
WhatsApp User gets reply
```

### Per-User Session Isolation

Each user gets their own:
- Baileys WebSocket connection
- Auth state stored in `sessions/{userId}/` directory
- QR code for initial pairing
- Auto-reconnect with exponential backoff (max 5 attempts)

## API Endpoints

All endpoints require `Authorization: Bearer <BRIDGE_SECRET>` header (shared secret with the API).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sessions/:userId/connect` | Start WhatsApp connection (generates QR) |
| DELETE | `/sessions/:userId?clear=true` | Disconnect (optionally clear session) |
| GET | `/sessions/:userId/status` | Connection status |
| GET | `/sessions/:userId/qr` | Get QR code as data URL |
| POST | `/messages/send` | Send message: `{ userId, jid, text }` |
| GET | `/health` | Health check (no auth) |

## Setup

```bash
# Install dependencies
npm install

# Create .env from template
cp .env.example .env
# Edit .env — BRIDGE_SECRET must match the API's BRIDGE_SECRET

# Run in development (hot-reload)
npm run dev

# Build for production
npm run build
npm start
```

## Development

```bash
# Type-check
npm run typecheck

# Lint
npm run lint

# Format
npm run format

# Run tests
npm test
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5174 | Server port |
| `API_URL` | http://localhost:5172 | FastAPI backend URL |
| `BRIDGE_SECRET` | (required) | Shared secret for API auth |
| `SESSIONS_DIR` | ./sessions | Baileys session storage path |
| `LOG_LEVEL` | info | Pino log level |

## Key Design Decisions

- **Thin bridge**: All business logic lives in the API. The bridge only handles WhatsApp protocol and message forwarding.
- **Shared secret auth**: Simple `Bearer` token auth between bridge and API. Not user-facing.
- **Filesystem sessions**: Baileys auth state stored per-user in `sessions/` directory. Survives restarts.
- **Reconnect backoff**: On disconnect, retries with exponential backoff (1s, 2s, 4s, 8s, 16s) up to 5 attempts. Logged out sessions are cleared automatically.
- **Text-only messages**: Currently extracts text from conversation messages, extended text, and image/video captions. Media attachments are not forwarded.

## Adding Support for New Message Types

To handle new WhatsApp message types (e.g., location, documents), edit `whatsapp.service.ts` in the `handleMessagesUpsert` method. Extract the content from the Baileys message object and forward it via `apiClient.postIncomingMessage()`.
