CREATE TABLE IF NOT EXISTS events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text NOT NULL,
  trigger text,
  data jsonb NOT NULL,
  server_ip text,
  prefetch_headers jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS heartbeats (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text NOT NULL,
  step int,
  screen_ms bigint,
  time_on_page_ms bigint,
  visibility text,
  has_focus boolean,
  had_interaction boolean,
  clicks int DEFAULT 0,
  touches int DEFAULT 0,
  client_ts bigint,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_hb_session ON heartbeats(session_id);
CREATE INDEX IF NOT EXISTS idx_hb_created ON heartbeats(created_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE heartbeats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert events" ON events;
CREATE POLICY "Allow anon insert events" ON events FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert heartbeats" ON heartbeats;
CREATE POLICY "Allow anon insert heartbeats" ON heartbeats FOR INSERT TO anon WITH CHECK (true);
