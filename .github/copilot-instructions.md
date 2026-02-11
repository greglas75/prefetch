# Code Rules — Prefetch
# Auto-generated from .claude/rules/*.md — do NOT edit directly.
# Edit files in .claude/rules/ and run: bash scripts/sync-rules.sh

# Accessibility Rules (MANDATORY)

Target: **Lighthouse Accessibility 100**. Every element must pass WCAG 2.1 AA.

## Semantic HTML
- Page wrapped in `<main>` landmark (required by Lighthouse).
- Footer uses `<footer>` element, not `<div class="footer">`.
- Steps are `<section>` elements with `aria-label`.
- Card area has `aria-live="polite"` for dynamic content announcements.

## Interactive elements
- All survey options: `role="radio"` with `aria-checked`, `tabindex`, `onkeydown`.
- Options grouped in `role="radiogroup"` with `aria-labelledby` pointing to question text.
- Arrow keys cycle through options. Enter/Space select.
- Selected option gets `tabindex="0"`, others get `tabindex="-1"`.
- All buttons have visible focus: `:focus-visible` outline.

## Progress bar
- `role="progressbar"` with `aria-label="Survey progress"`.
- `aria-valuenow` updated on every step change.
- `aria-valuemin="1"` and `aria-valuemax="3"`.

## Decorative elements
- SVG checkmark: `aria-hidden="true"`.
- Radio dots (`.option-radio`): `aria-hidden="true"`.
- Debug panel: `aria-hidden="true"`.

## Color contrast (WCAG AA)
- Normal text (< 18px): minimum **4.5:1** contrast ratio.
- Large text (>= 18px bold or >= 24px): minimum **3:1**.
- `--muted: #595959` on `--bg: #F5F3F7` = **5.2:1** — passes AA.
- **Never use `opacity` to dim text** — it breaks contrast calculations.
- Always check new colors at https://webaim.org/resources/contrastchecker/

---

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

---

# Color Scheme — TGM Panel (LOCKED)

These colors match the TGM Panel brand. Do NOT change without explicit approval.

```css
:root {
  --bg: #F5F3F7;          /* light purple tint — page background */
  --card: #FFFFFF;         /* white — card background */
  --text: #1A1A1A;         /* near-black — primary text */
  --muted: #595959;        /* dark gray — secondary text (WCAG AA on --bg) */
  --accent: #7B2D8E;       /* purple — progress dots, labels, radio selection */
  --accent-light: #F3E5F5; /* light purple — selected option background */
  --accent-hover: #5E1A6E; /* dark purple — accent hover state */
  --cta: #E91E63;          /* pink/crimson — primary action buttons */
  --cta-hover: #C2185B;    /* dark pink — button hover state */
  --border: #E0D8E5;       /* purple-gray — borders and dividers */
}
```

## Usage
| Variable | Where used |
|----------|-----------|
| `--accent` | Progress dots, step labels, radio borders, focus rings |
| `--cta` | "Start Survey", "Next", "Submit" buttons |
| `--accent-light` | Selected option background, hover option background |
| `--muted` | Subtitles, footer text, disabled button text |
| `--border` | Card border, option borders, disabled button background |

## Rules
- Never add new color variables without checking contrast ratios.
- CTA buttons use `--cta`, NOT `--accent`. They are different intentionally.
- Disabled buttons: `background: var(--border)`, `color: var(--muted)`.

---

# Deployment & Git Rules

## Deployment
- Push to `main` → auto-deploys to Vercel at https://startsurvey.vercel.app/
- Vercel serves `index.html` as static (no serverless functions).
- `server.js` does NOT run on Vercel — it's local-only.

## Git workflow
- Single branch: `main`.
- Commit messages: imperative mood, concise, explain WHY not WHAT.
- Always verify Vercel deployment after push.
- Never commit data files, secrets, or `.env` files.

## Before any change — checklist
1. **Tracking data changed?** → Update all 5 sync points (see `tracking.md`).
2. **External requests added?** → **NO.** Zero external dependencies on frontend.
3. **Accessibility affected?** → Run Lighthouse after deploying.
4. **Colors changed?** → Must match TGM Panel (see `colors.md`). Check contrast.
5. **First data timing?** → Must still send within 100ms. Test with `?debug=1`.
6. **Supabase schema changed?** → Add migration in `supabase/migrations/`.

## Vercel config
No `vercel.json` needed. Vercel auto-detects static site from `index.html`.

---

# Performance Rules (CRITICAL)

Facebook prefetches can be killed in <300ms. This page must load and send first data **within 100ms**.

## First data must be immediate
- `page_init` event fires **immediately** on script parse.
- No `setTimeout`, no `DOMContentLoaded`, no `requestAnimationFrame` before first send.
- `sendData('page_init')` is the FIRST call in the script body.

## Heartbeat timing
| Target | Interval | Payload |
|--------|----------|---------|
| Local server | 150ms | ~100 bytes (sendBeacon) |
| Supabase | 2s | ~200 bytes (fetch + headers) |

## Payload rules
- **Heartbeat:** minimal — `{sid, ts, step, scr_ms, vis, foc, int, clk, tch}`
- **Full event:** complete `detection` object — only on key triggers
- Key triggers: `page_init`, `page_load`, `first_visible`, `step_*`, `answer_*`, `page_close`, `before_unload`, `survey_complete`

## Network
- Use `navigator.sendBeacon()` for local server (fire-and-forget, no response needed).
- Use `fetch()` with `keepalive: true` for Supabase (needs Authorization header).
- Never use synchronous XHR.

## Server-side
- Buffer heartbeats in memory array, flush to disk every 2s with `fs.appendFile` (async).
- Never `fs.appendFileSync` on every heartbeat — it blocks the event loop at 7 req/s.
- Full events: `fs.appendFile` (async), not sync.
- Heartbeat response: HTTP 204 No Content (zero body).

---

# Security Rules

## What's public (by design)
- **Supabase anon key** in `index.html` — insert-only via RLS. Not a secret.
- **`index.html` source** — served as static file. All JS is visible to anyone.
- **Survey responses** — collected anonymously, no PII by design.

## What's SECRET (never in client code)
- **Supabase service_role key** — full database access. Only in local scripts.
- **Database password** — only via CLI auth or environment variables.
- **Server IP logs** — `collected_data.jsonl` contains `remote_ip`. Gitignored.

## Gitignored files (may contain sensitive data)
```
collected_data.jsonl    — contains IP addresses from local testing
heartbeats.jsonl        — contains IP addresses from local testing
node_modules/           — should never exist (no npm deps)
.env                    — should never exist (no env vars needed locally)
```

## Input validation
- Server validates JSON parse in try/catch. Malformed requests get 400.
- No user input is rendered as HTML (no XSS vector).
- No database queries with user input (Supabase REST API handles parameterization).

## Rate limiting
- No server-side rate limiting (local dev only).
- Supabase has built-in rate limiting on the free plan.
- Heartbeat to Supabase throttled to 2s client-side to avoid hitting limits.

---

# Supabase Rules

## Project
- **Ref:** `dpdzicoybbjlxhwxnpxu`
- **Region:** ap-southeast-1 (Singapore)
- **Dashboard:** https://supabase.com/dashboard/project/dpdzicoybbjlxhwxnpxu

## Tables

### `events`
Full detection payloads from key moments.
```sql
id              bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY
session_id      text      NOT NULL
trigger         text      -- e.g. 'page_init', 'step_1', 'page_close'
data            jsonb     NOT NULL  -- complete detection object
server_ip       text
prefetch_headers jsonb
created_at      timestamptz DEFAULT now()
```

### `heartbeats`
Lightweight pulses every 2s from client.
```sql
id              bigint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY
session_id      text      NOT NULL
step            int
screen_ms       bigint    -- ms on current screen
time_on_page_ms bigint    -- total ms since page load
visibility      text      -- 'visible' or 'hidden'
has_focus       boolean
had_interaction boolean
clicks          int       DEFAULT 0
touches         int       DEFAULT 0
client_ts       bigint    -- client-side Date.now()
created_at      timestamptz DEFAULT now()
```

### Indexes
- `idx_events_session` on `events(session_id)`
- `idx_events_created` on `events(created_at)`
- `idx_hb_session` on `heartbeats(session_id)`
- `idx_hb_created` on `heartbeats(created_at)`

## Row Level Security (RLS)
- Both tables: RLS **enabled**.
- Policy: `anon` role can **INSERT only**. No SELECT, UPDATE, DELETE.
- Reading data requires `service_role` key (admin scripts, not client).

## Keys
- **Anon key** — embedded in `index.html`. Public by design (insert-only RLS).
- **Service role key** — used ONLY in `setup_db.js` and local scripts. NEVER in client code.

## Schema changes
- All changes via migrations in `supabase/migrations/`.
- Push with: `supabase db push --include-all`
- Verify with: `node setup_db.js`

---

# Tracking Data Rules

## Detection fields sync (5-point checklist)
Every change to tracked data must be reflected in ALL of these:

1. **`detection` object** in `index.html` — the source of truth
2. **`sendHeartbeat()`** pulse object — if the field is in the lightweight heartbeat
3. **`sendHeartbeatSB()`** Supabase insert — if it maps to a heartbeat column
4. **Supabase table schema** — run migration in `supabase/migrations/` if adding columns
5. **Dashboard** in `server.js` — if the field should be visible in the dashboard table

## Screen timing (millisecond precision)
- `screen_enter_ms[step]` — set via `Date.now()` when entering a step
- `screen_durations_ms[step]` — accumulated total on step exit
- `screen_visits[step]` — array of `{enter, exit, duration_ms}` for every visit
- `screen_time_current_ms` — live snapshot computed before every `sendData()` call

## Event triggers
| Trigger | When | Payload |
|---------|------|---------|
| `page_init` | Immediately on script parse | Full |
| `page_load` | `window.load` event | Full |
| `first_visible` | First `visibilitychange` to visible | Full |
| `step_N` | Navigation to step N | Full |
| `answer_qN` | User selects an answer | Full |
| `survey_complete` | User submits final answer | Full |
| `page_close` | `pagehide` event | Full |
| `before_unload` | `beforeunload` event | Full |
| heartbeat | Every 150ms / 2s | Lightweight |

## Prefetch detection signals
Key fields that distinguish prefetch from real visit:
- `visibility_on_load` — `hidden` = likely prefetch
- `has_focus_on_load` — `false` = likely prefetch
- `had_any_interaction` — `false` after >5s = likely prefetch
- `navigation_type` — from Performance API
- `is_facebook_webview` — UA pattern match
- `_prefetch_headers` — server-side: `Purpose`, `Sec-Purpose`, `X-Moz`, FB headers

---

