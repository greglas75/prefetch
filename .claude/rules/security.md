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
