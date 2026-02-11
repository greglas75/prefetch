# Prefetch Detection Project

## Overview
Facebook prefetch detection system. Tracks whether page loads are real user visits or Facebook WebView prefetches. Deployed on Vercel, data stored in Supabase.

## Architecture
- `index.html` — Single-page survey (vanilla JS, no framework). Serves as both UI and tracking client.
- `server.js` — Local Node.js HTTP server (port 4567). Writes to local JSONL files + serves HTML.
- Supabase (remote) — PostgreSQL backend for production data from Vercel deployment.

## URLs
- **Production:** https://startsurvey.vercel.app/
- **Local:** http://localhost:4567/
- **Dashboard:** http://localhost:4567/dashboard
- **Debug mode:** http://localhost:4567/?debug=1
- **GitHub:** https://github.com/greglas75/prefetch
- **Supabase project:** dpdzicoybbjlxhwxnpxu (region: ap-southeast-1)

## Data Flow
1. Client sends lightweight heartbeats every 150ms (local) / 2s (Supabase)
2. Full event payloads sent on: `page_init`, `page_load`, `first_visible`, `step_*`, `answer_*`, `page_close`
3. Local server buffers heartbeats in memory, flushes to `heartbeats.jsonl` every 2s
4. Full events written to `collected_data.jsonl` (local) and `events` table (Supabase)

## Supabase Tables
- `events` — Full detection payloads (session_id, trigger, data JSONB)
- `heartbeats` — Lightweight pulses (session_id, step, screen_ms, visibility, etc.)
- RLS enabled: anon INSERT allowed, no SELECT/UPDATE/DELETE for anon

## Color Scheme (TGM Panel)
- Accent (purple): `#7B2D8E`
- CTA buttons (pink): `#E91E63`
- Background: `#F5F3F7`
- Text: `#1A1A1A`
- Muted: `#595959`

## Running Locally
```bash
node server.js
# Opens on http://localhost:4567/
```

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Survey UI + all tracking JS (single file) |
| `server.js` | Local HTTP server + dashboard + data collection |
| `setup_db.js` | Supabase table verification script |
| `collected_data.jsonl` | Local full event log (gitignored) |
| `heartbeats.jsonl` | Local heartbeat log (gitignored) |
