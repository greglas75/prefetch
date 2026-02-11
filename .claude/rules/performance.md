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
