#!/bin/bash
# ─────────────────────────────────────────────
# damages.co.il — xCloud Deploy Hook
# Run after git pull on the server
# ─────────────────────────────────────────────

echo "⚡ damages.co.il — Build starting..."

# Install dependencies (if needed)
npm install --production 2>/dev/null

# Build everything
node scripts/build_search_index.js
node scripts/build_static.js

echo "✅ Deploy complete!"
