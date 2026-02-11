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
