const SUPABASE_URL = 'https://dpdzicoybbjlxhwxnpxu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZHppY295YmJqbHhod3hucHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc2NDY2MywiZXhwIjoyMDg2MzQwNjYzfQ.OSwO_WeVW8zpOsxcBtjZc4ZvT98cb4_F2zurlaQc7II';

async function main() {
  console.log('=== Verifying Supabase tables ===\n');

  const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  };

  // 1. Check that both tables exist and are accessible
  for (const table of ['events', 'heartbeats']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=0`, {
      headers: { ...headers, 'Prefer': 'count=exact' },
    });
    const contentRange = res.headers.get('content-range');
    if (res.ok) {
      console.log(`Table "${table}": EXISTS (status ${res.status}, content-range: ${contentRange})`);
    } else {
      const err = await res.text();
      console.log(`Table "${table}": FAILED - ${err}`);
    }
  }

  // 2. Test insert into events table (using anon-like insert via service role)
  console.log('\n=== Testing inserts ===\n');

  const testEvent = {
    session_id: 'test-session-001',
    trigger: 'test',
    data: { test: true, message: 'setup verification' },
    server_ip: '127.0.0.1',
  };

  const eventRes = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(testEvent),
  });

  if (eventRes.ok) {
    const inserted = await eventRes.json();
    console.log('events INSERT: SUCCESS');
    console.log('  Inserted row:', JSON.stringify(inserted, null, 2));
  } else {
    const err = await eventRes.text();
    console.log(`events INSERT: FAILED - ${err}`);
  }

  const testHeartbeat = {
    session_id: 'test-session-001',
    step: 0,
    screen_ms: 1920,
    time_on_page_ms: 5000,
    visibility: 'visible',
    has_focus: true,
    had_interaction: false,
    clicks: 0,
    touches: 0,
    client_ts: Date.now(),
  };

  const hbRes = await fetch(`${SUPABASE_URL}/rest/v1/heartbeats`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(testHeartbeat),
  });

  if (hbRes.ok) {
    const inserted = await hbRes.json();
    console.log('heartbeats INSERT: SUCCESS');
    console.log('  Inserted row:', JSON.stringify(inserted, null, 2));
  } else {
    const err = await hbRes.text();
    console.log(`heartbeats INSERT: FAILED - ${err}`);
  }

  // 3. Read back the data
  console.log('\n=== Reading back data ===\n');

  for (const table of ['events', 'heartbeats']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5`, {
      headers,
    });
    if (res.ok) {
      const rows = await res.json();
      console.log(`${table}: ${rows.length} row(s) found`);
      for (const row of rows) {
        console.log(`  id=${row.id}, session_id=${row.session_id}, created_at=${row.created_at}`);
      }
    } else {
      const err = await res.text();
      console.log(`${table}: FAILED to read - ${err}`);
    }
  }

  // 4. Clean up test data
  console.log('\n=== Cleaning up test data ===\n');

  for (const table of ['events', 'heartbeats']) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}?session_id=eq.test-session-001`, {
      method: 'DELETE',
      headers,
    });
    console.log(`Deleted test rows from ${table}: status ${delRes.status}`);
  }

  console.log('\n=== All done! Tables are created and working. ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
