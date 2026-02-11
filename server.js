const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4567;
const DATA_FILE = path.join(__dirname, 'collected_data.jsonl');
const HB_FILE = path.join(__dirname, 'heartbeats.jsonl');

// Ensure data files exist
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '');
if (!fs.existsSync(HB_FILE)) fs.writeFileSync(HB_FILE, '');

// Buffer heartbeats in memory — flush to disk every 2s to reduce I/O
let hbBuffer = [];
setInterval(() => {
  if (hbBuffer.length === 0) return;
  const chunk = hbBuffer.join('');
  hbBuffer = [];
  fs.appendFile(HB_FILE, chunk, () => {});
}, 2000);

const server = http.createServer((req, res) => {

  // CORS headers (needed for Facebook WebView)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Serve landing page
  if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?'))) {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // Collect data
  if (req.method === 'POST' && req.url === '/collect') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Lightweight heartbeat — buffer in memory, don't block
        if (data.t === 'hb') {
          data._ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          data._at = Date.now();
          hbBuffer.push(JSON.stringify(data) + '\n');
          res.writeHead(204);
          return res.end();
        }

        // Full event — add server-side info
        data._server = {
          received_at: new Date().toISOString(),
          remote_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          headers: req.headers
        };

        data._prefetch_headers = {
          purpose: req.headers['purpose'] || null,
          sec_purpose: req.headers['sec-purpose'] || null,
          x_purpose: req.headers['x-purpose'] || null,
          x_moz: req.headers['x-moz'] || null,
          x_fb_http_engine: req.headers['x-fb-http-engine'] || null,
          x_fb_connection_type: req.headers['x-fb-connection-type'] || null
        };

        const line = JSON.stringify(data) + '\n';
        fs.appendFile(DATA_FILE, line, () => {});

        console.log(`[${data.send_trigger}] session=${data.session_id} visible=${data.visibility_on_load} focus=${data.has_focus_on_load} fb=${data.is_facebook_webview} interactions=${data.had_any_interaction}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        console.error('Parse error:', e.message);
        res.writeHead(400);
        res.end('{"error":"bad json"}');
      }
    });
    return;
  }

  // Simple dashboard to view collected data
  if (req.method === 'GET' && req.url === '/dashboard') {
    const lines = fs.readFileSync(DATA_FILE, 'utf8').trim().split('\n').filter(Boolean);
    const entries = lines.map(l => { try { return JSON.parse(l); } catch(e) { return null; } }).filter(Boolean);

    // Group by session
    const sessions = {};
    entries.forEach(e => {
      if (!sessions[e.session_id]) sessions[e.session_id] = [];
      sessions[e.session_id].push(e);
    });

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Prefetch Detection Dashboard</title>
    <style>
      body { font-family: monospace; background: #111; color: #eee; padding: 20px; font-size: 13px; }
      h1 { color: #00ff88; margin-bottom: 4px; }
      .stats { color: #888; margin-bottom: 24px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
      th { background: #222; text-align: left; padding: 8px 10px; color: #00ff88; border-bottom: 2px solid #333; }
      td { padding: 6px 10px; border-bottom: 1px solid #222; }
      .prefetch { background: #3a1111; }
      .real { background: #113a11; }
      .unknown { background: #2a2a11; }
      .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
      .tag-prefetch { background: #ff4444; color: #fff; }
      .tag-real { background: #00cc55; color: #fff; }
      .tag-unknown { background: #ccaa00; color: #000; }
      .tag-fb { background: #1877f2; color: #fff; }
      .detail { color: #888; font-size: 11px; }
      .refresh { color: #00ff88; text-decoration: none; border: 1px solid #00ff88; padding: 6px 16px; display: inline-block; margin-bottom: 20px; }
      .refresh:hover { background: #00ff88; color: #111; }
    </style></head><body>
    <h1>🔍 Prefetch Detection Dashboard</h1>
    <div class="stats">${Object.keys(sessions).length} unique sessions &middot; ${entries.length} total events &middot; Last updated: ${new Date().toISOString()}</div>
    <a href="/dashboard" class="refresh">↻ Refresh</a>
    <table>
    <tr>
      <th>Session</th>
      <th>Classification</th>
      <th>Visibility on Load</th>
      <th>Focus on Load</th>
      <th>FB WebView</th>
      <th>Had Interaction</th>
      <th>Steps Reached</th>
      <th>Screen Times</th>
      <th>Nav Type</th>
      <th>Viewport</th>
      <th>First Event</th>
      <th>Events</th>
    </tr>`;

    Object.entries(sessions).forEach(([sid, events]) => {
      // Use the latest event for most data
      const latest = events[events.length - 1];
      const first = events[0];

      // Classify
      let cls = 'unknown';
      let tag = '<span class="tag tag-unknown">UNKNOWN</span>';

      if (first.visibility_on_load === 'hidden' && !latest.had_any_interaction) {
        cls = 'prefetch';
        tag = '<span class="tag tag-prefetch">PREFETCH</span>';
      } else if (first.visibility_on_load === 'visible' && latest.had_any_interaction) {
        cls = 'real';
        tag = '<span class="tag tag-real">REAL USER</span>';
      } else if (first.visibility_on_load === 'hidden' && latest.had_any_interaction) {
        cls = 'real';
        tag = '<span class="tag tag-real">REAL (was hidden)</span>';
      }

      const fb = latest.is_facebook_webview ? '<span class="tag tag-fb">FB</span>' : '-';
      const triggers = events.map(e => e.send_trigger).join(', ');

      // Screen times - build readable string from latest event
      let screenTimesHtml = '-';
      if (latest.screen_durations_ms) {
        const parts = Object.entries(latest.screen_durations_ms).map(([step, ms]) => {
          const sec = (ms / 1000).toFixed(1);
          return 'S' + step + ': ' + ms + 'ms (' + sec + 's)';
        });
        // Add current screen live time if available
        if (latest.screen_time_current_ms) {
          const cs = latest.screen_time_current_ms;
          const sec = (cs.elapsed_ms / 1000).toFixed(1);
          const existing = parts.findIndex(p => p.startsWith('S' + cs.step + ':'));
          if (existing === -1) {
            parts.push('S' + cs.step + ': ' + cs.elapsed_ms + 'ms (' + sec + 's)*');
          } else {
            parts[existing] = 'S' + cs.step + ': ' + cs.elapsed_ms + 'ms (' + sec + 's)*';
          }
        }
        screenTimesHtml = parts.join('<br>');
      }

      html += `<tr class="${cls}">
        <td>${sid.substring(0, 8)}...</td>
        <td>${tag}</td>
        <td>${first.visibility_on_load}</td>
        <td>${first.has_focus_on_load}</td>
        <td>${fb}</td>
        <td>${latest.had_any_interaction} ${latest.had_any_interaction ? '(' + latest.total_clicks + 'c/' + latest.total_touches + 't)' : ''}</td>
        <td>${latest.steps_reached ? latest.steps_reached.join('→') : '0'}</td>
        <td class="detail">${screenTimesHtml}</td>
        <td>${first.navigation_type || '-'}</td>
        <td>${first.viewport_w}x${first.viewport_h}</td>
        <td class="detail">${first._server ? first._server.received_at : '-'}</td>
        <td class="detail">${triggers}</td>
      </tr>`;
    });

    html += '</table></body></html>';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // Export raw data
  if (req.method === 'GET' && req.url === '/export') {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Content-Disposition': 'attachment; filename="prefetch_data.jsonl"'
    });
    return res.end(data);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  Facebook Prefetch Detection Server                  ║
║                                                      ║
║  Landing page:  http://localhost:${PORT}/              ║
║  Debug mode:    http://localhost:${PORT}/?debug=1      ║
║  Dashboard:     http://localhost:${PORT}/dashboard     ║
║  Export data:   http://localhost:${PORT}/export         ║
║                                                      ║
║  Data file:     ${DATA_FILE}  ║
╚══════════════════════════════════════════════════════╝
  `);
});
