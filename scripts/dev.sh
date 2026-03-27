#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}=== Mia Kelisap — Starting All Services ===${NC}"
echo ""

# ── Ensure ChromaDB is running ───────────────────────────────────────
if ! docker compose ps --status running 2>/dev/null | grep -q chromadb; then
  echo -e "${YELLOW}Starting ChromaDB...${NC}"
  docker compose up -d
fi

# ── Trap to kill all background processes on exit ────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down all services...${NC}"
  kill $API_PID $BRIDGE_PID $WEB_PID 2>/dev/null || true
  wait $API_PID $BRIDGE_PID $WEB_PID 2>/dev/null || true
  echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT INT TERM

# ── Start API server ────────────────────────────────────────────────
echo -e "${BLUE}[API]${NC}    Starting FastAPI on http://localhost:5172"
(cd mia-kelisap-api && uv run uvicorn mia_kelisap.main:app --host 0.0.0.0 --port 5172 --reload) &
API_PID=$!

# ── Start Bridge server ─────────────────────────────────────────────
echo -e "${BLUE}[Bridge]${NC} Starting Baileys bridge on http://localhost:5174"
(cd mia-kelisap-bridge && npm run dev) &
BRIDGE_PID=$!

# ── Start Web dev server ────────────────────────────────────────────
echo -e "${BLUE}[Web]${NC}    Starting Vite on http://localhost:5173"
(cd mia-kelisap-web && npm run dev) &
WEB_PID=$!

echo ""
echo -e "${GREEN}All services started!${NC}"
echo ""
echo -e "  API:     http://localhost:5172"
echo -e "  API docs: http://localhost:5172/docs"
echo -e "  Bridge:  http://localhost:5174"
echo -e "  Web:     http://localhost:5173"
echo -e "  ChromaDB: http://localhost:8000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait
