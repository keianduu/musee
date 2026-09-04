# Muuzee Admin v0

## Purpose

Admin v0 completes this internal workflow:

```text
Art Commons import
  → Draft exhibition
  → Missing-image review
  → Copy image-research prompt
  → Human rights research and decision
  → Image upload
  → Readiness validation
  → Explicit publish
```

## Routes

- `/admin`: dashboard counts and latest import.
- `/admin/imports`: run a controlled Art Commons import and review history.
- `/admin/exhibitions`: search and filter normalized exhibitions.
- `/admin/exhibitions/[id]`: edit metadata, inspect raw source, upload/delete an image, and change publication state.

## Security boundary

**Until Admin authentication is implemented, Admin is limited to local development or a separately protected staging environment. Supabase Auth (or equivalent Admin authentication and authorization) is mandatory before production internet exposure.**

The browser never receives `SUPABASE_SERVICE_ROLE_KEY`. All database mutations, imports, Storage writes, and publication decisions run in server route handlers.

## Import safety

- Admin imports every source result matching the specified keyword and date condition; there is no 100-record UI cap or manual start offset.
- Default date range is today through one year later. Japan Search Scroll API narrows to `f-db=exhib` and the requested years, then exact day-level overlap is checked locally.
- Scroll pages are requested sequentially until the snapshot ends. Detail records are also fetched sequentially with the configured request delay.
- Import history separates upstream API hits, scanned records, exact-date eligible records, fetched details, exclusions, and errors.
- Past or undated source records are imported only when the Admin explicitly enables that option.
- Initial validation should use 3–5 records, then 20, then 100 only after review.
- Detail calls are sequential with a configurable delay.
- Raw JSON is retained before normalized records are considered complete.
- Import errors are counted and retained in `import_runs.errors`.
- No import automatically publishes.

## Image workflow

The research prompt is generated locally from the exhibition and occurrence. It instructs the researcher to use official or open sources and to return evidence, not a legal conclusion. Muuzee does not call an OpenAI API.

Upload requires source type and rights status. Choosing `approved` is an explicit human action. The private Storage object is referenced by `media_assets`; Admin uses signed URLs for previews.

When the API includes an image URL, Admin may show it as an `API candidate`. This is a remote reference for research only; it is not downloaded, made Primary, or rights-approved automatically.

## Publish validation

The UI displays missing requirements, but the route handler repeats the validation on the server. A disabled button is never the security boundary.
