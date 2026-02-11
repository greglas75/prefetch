# Architecture Rules

## Single-file frontend
- `index.html` contains ALL frontend code: HTML + CSS + JS in one file. Do NOT split.
- No npm packages on the frontend. Vanilla JS only. No jQuery, no React, no build step.
- External requests: ONLY to `/collect` (local) and Supabase REST API.
- **Zero CDNs, zero Google Fonts, zero analytics scripts.** Every byte served locally.

## Server is local-only
- `server.js` runs on localhost for development/testing. It does NOT run on Vercel.
- Vercel serves `index.html` as static. All data goes directly to Supabase from the client.
- Never add `node_modules` dependencies. Use only Node.js built-in modules (`http`, `fs`, `path`).

## Dual data collection
- **Local server:** writes to JSONL files (fast, for development)
- **Supabase:** REST API inserts (production, from Vercel)
- Both paths must stay in sync. If you add a field to one, add it to the other.

## File structure
```
Prefetch/
  index.html              — Frontend (HTML + CSS + JS, single file)
  server.js               — Local dev server (Node.js built-ins only)
  setup_db.js             — Supabase verification script
  CLAUDE.md               — Project overview
  .claude/
    rules/                — Modular project rules (this directory)
    settings.json         — Permissions and hooks
  supabase/
    config.toml           — Supabase CLI config
    migrations/           — Database schema migrations
  collected_data.jsonl    — Local event data (gitignored)
  heartbeats.jsonl        — Local heartbeat data (gitignored)
```
