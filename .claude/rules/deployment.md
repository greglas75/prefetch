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
