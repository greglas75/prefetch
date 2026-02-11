# Facebook Prefetch Detection Test

## What This Does

A minimal landing page disguised as a simple survey that captures detailed signals 
to detect whether Facebook is prefetching pages before users actually click ads.

## Signals Captured

### Client-side (JavaScript)
- `document.visibilityState` on load (hidden = likely prefetch)
- `document.hasFocus()` on load
- Navigation type from Performance API
- All interaction events (click, scroll, touch, mousemove, keydown)
- Visibility change timeline (hidden→visible transitions)
- Focus/blur events timeline
- Facebook WebView detection (FBAN/FBAV in User-Agent)
- Instagram WebView detection
- iframe detection
- Viewport dimensions (prefetch may use non-standard sizes)
- Connection info
- Full survey progress tracking with timestamps

### Server-side (HTTP headers)
- `Purpose: prefetch` / `Sec-Purpose: prefetch` headers
- Facebook-specific headers (`x-fb-http-engine`, `x-fb-connection-type`)
- Full request headers dump
- Client IP for session correlation

## Quick Start

```bash
# Run locally
node server.js

# Landing page: http://localhost:3000
# Debug mode:   http://localhost:3000/?debug=1
# Dashboard:    http://localhost:3000/dashboard
# Export data:  http://localhost:3000/export
```

## Deploy for Facebook Ads Test

1. Deploy to a public server (VPS, Railway, Render, etc.)
2. Point a domain to it (Facebook prefers domains with SSL)
3. Create a Facebook Ad campaign:
   - Objective: Traffic
   - Target: New Mexico & Texas
   - Link: your deployed URL
   - Budget: minimal ($5-10/day is enough)
4. Let it run for 24-48 hours
5. Check `/dashboard` for results

## Interpreting Results

### Classification Logic

| Visibility on Load | Had Interaction | Classification |
|---|---|---|
| `hidden` | `false` | **PREFETCH** (Facebook loaded the page but user never saw it) |
| `visible` | `true` | **REAL USER** (normal visit) |
| `hidden` | `true` | **REAL USER** (page was prefetched, then user actually opened it) |
| `visible` | `false` | **UNKNOWN** (page was visible but no interaction - could be bounce) |

### Key Metrics to Compare

- Ratio of PREFETCH vs REAL sessions → explains the gap between Link Clicks and Landing Page Views
- Facebook WebView % → confirms traffic is from Facebook app
- Time between `hidden` → `visible` for sessions that start hidden → shows prefetch-to-view delay
- Sessions with `hidden` visibility that NEVER become visible → pure prefetch waste

## Data Format

Data is stored as JSONL (one JSON object per line) in `collected_data.jsonl`.
Each line contains the full detection object plus server-side metadata.

Export via `GET /export` for analysis in Python/pandas/etc.
