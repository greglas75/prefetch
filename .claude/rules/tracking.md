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
