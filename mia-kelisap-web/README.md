# mia-kelisap-web

React frontend dashboard for Mia Kelisap. Dark-themed editorial UI for managing your AI WhatsApp companion — settings, conversations, memory, and analytics.

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite** — build tool
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — accessible component primitives (Button, Card, Dialog, Sheet, Select, Switch, Slider, etc.)
- **TanStack Query** — server state management
- **Zustand** — client state (auth token)
- **Axios** — HTTP client with auth interceptor
- **Lucide React** — icons
- **Instrument Sans** + **Space Mono** — typography (Google Fonts)

## Project Structure

```
src/
├── main.tsx                        # Entry point
├── App.tsx                         # QueryClientProvider + Router
├── router.tsx                      # Path-based routing with auth guard
├── index.css                       # Tailwind + shadcn theme + custom animations
├── api/
│   ├── client.ts                   # Axios instance with JWT interceptor
│   ├── auth.ts                     # Login, signup, getMe
│   ├── conversations.ts            # Fetch conversations + messages
│   ├── memory.ts                   # Fetch, search, delete memories
│   ├── settings.ts                 # Get/update user settings
│   ├── contacts.ts                 # Contact rules CRUD
│   ├── whatsapp.ts                 # WhatsApp connect/disconnect/status
│   └── analytics.ts                # Analytics overview
├── hooks/
│   ├── use-auth.ts                 # useLogin, useSignup, useUser
│   ├── use-conversations.ts        # useConversations, useMessages
│   ├── use-memory.ts               # useMemories, useSearchMemories, useDeleteMemory
│   ├── use-settings.ts             # useSettings, useUpdateSettings
│   ├── use-contacts.ts             # useContactRules, useCreateContactRule, useDeleteContactRule
│   ├── use-whatsapp.ts             # useWhatsAppStatus, useConnectWhatsApp
│   └── use-analytics.ts            # useAnalytics
├── stores/
│   └── auth-store.ts               # Zustand store — JWT token + user, persisted to localStorage
├── types/
│   ├── auth.ts                     # User, AuthResponse, LoginRequest, SignupRequest
│   ├── conversation.ts             # Conversation, ConversationListResponse
│   ├── message.ts                  # Message, MessageListResponse
│   ├── memory.ts                   # MemoryItem, MemoryListResponse
│   ├── settings.ts                 # UserSettings, UpdateSettingsRequest
│   ├── contacts.ts                 # ContactRule, ContactRuleList, CreateContactRuleRequest
│   └── analytics.ts                # AnalyticsOverview
├── components/
│   ├── ui/                         # shadcn components + custom (pulse-dot, stat-card)
│   ├── layout/                     # RootLayout (sidebar + main), AuthLayout, PageHeader
│   ├── auth/                       # LoginForm, SignupForm
│   ├── conversations/              # ConversationList, ConversationDetail, MessageBubble
│   ├── memory/                     # MemoryBrowser, MemoryCard, MemorySearch
│   ├── whatsapp/                   # QrScanner, ConnectionStatus
│   ├── settings/                   # AgentPersonaForm, ApiKeyForm, DebounceConfig, ContactAccessControl
│   └── analytics/                  # StatsOverview
├── pages/
│   ├── login.tsx
│   ├── signup.tsx
│   ├── dashboard.tsx               # Stats + WhatsApp QR
│   ├── conversations.tsx           # Split-pane chat viewer
│   ├── memory.tsx                  # Semantic search + memory grid
│   ├── settings.tsx                # Persona, LLM keys, debounce, contact access
│   └── analytics.tsx               # Stats cards
└── lib/
    ├── utils.ts                    # cn(), formatDate(), truncate()
    └── constants.ts                # API_URL
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email/password sign-in |
| `/signup` | Signup | Account creation |
| `/dashboard` | Dashboard | Stats overview + WhatsApp connection |
| `/conversations` | Conversations | Split-pane: conversation list + message thread |
| `/memory` | Memory | Semantic search + memory card grid with delete |
| `/settings` | Settings | Agent persona, reply style, LLM keys, debounce, contact access control |
| `/analytics` | Analytics | Message counts + memory stats |

## Design System

**Theme**: Dark editorial — near-black backgrounds, WhatsApp green accent (#22c55e), flat cards with 1px borders.

| Token | Value |
|-------|-------|
| Background | `#0a0a0b` |
| Card / Surface | `#141416` |
| Border | `#2a2a2e` |
| Text | `#ececef` |
| Muted text | `#8b8b8e` |
| Primary (accent) | `#22c55e` |
| Destructive | `#ef4444` |

**Typography**: `Instrument Sans` (body), `Space Mono` (monospace — stats, timestamps, IDs).

**Animations**: Staggered `fade-up` on page load, `pulse-dot` for status indicators, noise grain overlay.

## Setup

```bash
# Install dependencies
npm install

# Create .env
cp .env.example .env

# Start dev server
npm run dev
```

Open http://localhost:5173

## Development

```bash
# Type-check
npx tsc --noEmit

# Build for production
npx vite build

# Preview production build
npx vite preview
```

## Adding a New Page

1. Create `src/pages/your-page.tsx` — use `RootLayout` + `PageHeader`
2. Add route in `src/router.tsx`
3. Add nav item in `src/components/layout/sidebar.tsx`

## Adding a New API Endpoint

1. Add TypeScript types in `src/types/`
2. Add API function in `src/api/` (uses the shared `apiClient` with auth)
3. Create TanStack Query hook in `src/hooks/`
4. Use the hook in your component

## Conventions

- **Hooks** wrap TanStack Query — components never call API functions directly
- **Auth** is handled by Zustand store + Axios interceptor — 401 auto-redirects to `/login`
- **Imports** use `@/` path alias mapped to `src/`
- **Components** use shadcn/ui primitives wherever possible
- **Forms** use controlled state with `useState`, not form libraries
