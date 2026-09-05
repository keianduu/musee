# Muuzee

Muuzee currently contains an exploratory static prototype and the first production Admin vertical slice.

## Production Admin v0

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill the Supabase values.
3. Start Supabase locally: `npx supabase start`
4. Apply/reset migrations: `npx supabase db reset`
5. Start Next.js: `npm run dev`
6. Open `http://localhost:3000/admin`

See `docs/master-data-architecture.md`, `docs/architecture.md`, `docs/data-model.md`, `docs/admin-v0.md`, and `docs/integrations/art-commons.md`.

> Admin has no authentication in v0. It is local/protected-staging only. Add Supabase Auth and Admin authorization before any production internet exposure.
