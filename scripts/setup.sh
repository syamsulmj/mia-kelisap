#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== Mia Kelisap — Setup ==="
echo ""

# ── 1. Generate secrets ──────────────────────────────────────────────
generate_secret() {
  openssl rand -hex 32
}

JWT_SECRET=$(generate_secret)
BRIDGE_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(cd mia-kelisap-api && uv run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# ── 2. Create .env files ─────────────────────────────────────────────
echo "Creating .env files..."

if [ ! -f mia-kelisap-api/.env ]; then
  cat > mia-kelisap-api/.env <<EOF
DATABASE_URL=postgresql+asyncpg://localhost:5432/mia_kelisap
CHROMA_HOST=localhost
CHROMA_PORT=8000
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
BRIDGE_URL=http://localhost:5174
BRIDGE_SECRET=${BRIDGE_SECRET}
DEBOUNCE_DEFAULT_SECONDS=90
EOF
  echo "  Created mia-kelisap-api/.env"
else
  echo "  mia-kelisap-api/.env already exists, skipping"
fi

if [ ! -f mia-kelisap-bridge/.env ]; then
  cat > mia-kelisap-bridge/.env <<EOF
PORT=5174
API_URL=http://localhost:5172
BRIDGE_SECRET=${BRIDGE_SECRET}
SESSIONS_DIR=./sessions
LOG_LEVEL=info
EOF
  echo "  Created mia-kelisap-bridge/.env"
else
  echo "  mia-kelisap-bridge/.env already exists, skipping"
fi

if [ ! -f mia-kelisap-web/.env ]; then
  cat > mia-kelisap-web/.env <<EOF
VITE_API_URL=http://localhost:5172
EOF
  echo "  Created mia-kelisap-web/.env"
else
  echo "  mia-kelisap-web/.env already exists, skipping"
fi

# ── 3. Install dependencies ──────────────────────────────────────────
echo ""
echo "Installing dependencies..."

echo "  [API] uv sync..."
(cd mia-kelisap-api && uv sync --dev --quiet)

echo "  [Bridge] npm install..."
(cd mia-kelisap-bridge && npm install --silent)

echo "  [Web] npm install..."
(cd mia-kelisap-web && npm install --silent)

# ── 4. Create database ──────────────────────────────────────────────
echo ""
echo "Setting up PostgreSQL database..."
if psql -lqt | cut -d \| -f 1 | grep -qw mia_kelisap; then
  echo "  Database 'mia_kelisap' already exists"
else
  createdb mia_kelisap
  echo "  Created database 'mia_kelisap'"
fi

# ── 5. Run migrations ───────────────────────────────────────────────
echo ""
echo "Running database migrations..."
(cd mia-kelisap-api && uv run alembic upgrade head 2>/dev/null || echo "  No migrations to run yet — generate one first with: cd mia-kelisap-api && uv run alembic revision --autogenerate -m 'initial'")

# ── 6. Start ChromaDB ───────────────────────────────────────────────
echo ""
echo "Starting ChromaDB via Docker..."
docker compose up -d
echo "  ChromaDB running on http://localhost:8000"

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Run all services with:  ./scripts/dev.sh"
echo ""
