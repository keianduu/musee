# Muuzee Production Architecture v0

Status: Approved for the first production vertical slice on 2026-09-04.

## Scope

This architecture supports internal exhibition ingestion and editorial administration only. Public Muuzee pages, user authentication, consumer features, analytics, payments, PWA, and deployment are outside this slice.

## Runtime

```text
Browser
  ↓
Next.js App Router / Vercel (future deployment target)
  ↓
Supabase PostgreSQL / Storage
```

The Admin UI uses server-side Next.js code and route handlers. The Supabase service-role key is server-only and must never be exposed through a `NEXT_PUBLIC_*` variable or client bundle.

Before Admin authentication exists, `/admin` is for local development or a separately protected staging environment only. It must not be published to the production internet.

## Data flow

```text
External API (Art Commons via Japan Search)
  ↓
Importer
  ↓
Raw Source Record
  ↓
Muuzee Normalized DB
  ↓
Admin review / image rights review
  ↓
Public Service (Future)
```

Raw source JSON is retained in `source_records`. Normalized tables are used by Admin. An import always starts an exhibition in `draft`; importing data or seeing a source image never publishes it.

Admin full import uses Japan Search's scroll snapshot rather than ordinary offset pagination. This avoids the ordinary 2,000-result pagination ceiling and keeps one stable upstream result set per import. Muuzee scans the snapshot to its end, applies exact day-level overlap validation, and only then fetches and normalizes eligible detail records.

## Responsibility boundaries

- `prototype/`: exploratory UX and visual reference. It is not runtime code and is not imported by Production.
- `src/app/`: production Next.js routes and Admin UI.
- `src/lib/`: production integration, persistence, and validation logic.
- `supabase/migrations/`: versioned PostgreSQL and Storage setup.
- Notion: approved product intent and decisions.
- Git: implementation history.

## Deliberate v0 constraints

- No ORM; Supabase client plus SQL migrations.
- No remote Supabase project is created by this work.
- No automatic image discovery or automatic rights decision.
- API-provided image URLs may be retained as unapproved source candidates; they remain separate from Storage-backed publication assets.
- No Admin auth in v0; production exposure is prohibited until auth and authorization are implemented.
- One normalized occurrence is maintained for each imported Art Commons source record in this slice. The schema supports multiple occurrences for future tours.
