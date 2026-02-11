# Prefetch Detection Project

## Overview
Facebook prefetch detection system. Tracks whether page loads are real user visits or Facebook WebView prefetches. Single-page vanilla JS app + Node.js local server. Deployed on Vercel, data stored in Supabase.

## Architecture
```
index.html  →  Single file: HTML + CSS + JS (no framework, no build step)
server.js   →  Local Node.js HTTP server (port 4567, built-in modules only)
Supabase    →  Remote PostgreSQL for production data (Vercel deployment)
```

## URLs
| Environment | URL |
|-------------|-----|
| Production | https://startsurvey.vercel.app/ |
| Local | http://localhost:4567/ |
| Debug mode | http://localhost:4567/?debug=1 |
| Dashboard | http://localhost:4567/dashboard |
| GitHub | https://github.com/greglas75/prefetch |

## Quick Start
```bash
node server.js    # starts on http://localhost:4567/
```

## Data Flow
```
Browser → sendBeacon(/collect)  → server.js → collected_data.jsonl (local)
Browser → fetch(Supabase REST)  → Supabase  → events / heartbeats tables
```
- Lightweight heartbeats: every 150ms (local) / 2s (Supabase)
- Full payloads: on `page_init`, `page_load`, `first_visible`, `step_*`, `answer_*`, `page_close`

## Supabase
- Project ref: `dpdzicoybbjlxhwxnpxu` (ap-southeast-1)
- Tables: `events` (full payloads), `heartbeats` (lightweight pulses)
- RLS: anon INSERT only. Service role for admin scripts only.

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Survey UI + all tracking JS |
| `server.js` | Local HTTP server + dashboard |
| `setup_db.js` | Supabase table verification |
| `.claude/rules/` | Modular project rules |

## Rules
All project rules are in `.claude/rules/` organized by topic:
- `architecture.md` — project structure, no-framework constraint
- `performance.md` — 100ms first-data requirement, heartbeat timing
- `tracking.md` — detection fields, screen timing, sync checklist
- `accessibility.md` — WCAG AA, Lighthouse 100 target
- `colors.md` — TGM Panel color scheme (locked)
- `supabase.md` — tables, RLS, keys
- `security.md` — what's public, what's secret
- `deployment.md` — Git, Vercel, checklist
