# Muuzee Data Model v0

## Entities

| Table | Role |
| --- | --- |
| `venues` | Museum, gallery, or other venue master |
| `exhibitions` | Exhibition identity and publication state |
| `exhibition_occurrences` | Where and when an exhibition takes place |
| `data_sources` | External provider and terms metadata |
| `source_records` | Latest retained raw source payload and sync identity |
| `source_image_candidates` | API-provided image URLs and rights metadata awaiting human review |
| `import_runs` | Import execution counts, errors, and timing |
| `media_assets` | Human-reviewed exhibition images and rights metadata |

## Core relationships

```text
data_sources 1 ── * source_records * ── 0..1 exhibitions
source_records 1 ── * source_image_candidates
data_sources 1 ── * import_runs
exhibitions 1 ── * exhibition_occurrences * ── 1 venues
exhibitions 1 ── * media_assets
```

`source_records(data_source_id, external_id)` is unique. On re-import, the stored `entity_id` identifies the existing exhibition, so duplicate exhibitions are not created. Occurrences are updated through the existing exhibition relationship.

## Publication state

```text
draft → ready → published → archived
```

An imported exhibition starts as `draft`. `ready` requires title, venue, at least one start or end date, a primary image, and `approved` rights for that primary image. `published` requires the same server-side validation and an explicit Admin action.

Unpublish returns to `ready` if all requirements still pass; otherwise it returns to `draft`.

## Media and rights

Images live in the private `exhibition-images` Supabase Storage bucket, never in Git. `media_assets` can store provenance, credit, usage notes, validity, and the human-selected rights state. Source URL, credit, and usage notes are nullable and are not upload prerequisites.

The system never infers that an image is legally usable. Only an Admin user can explicitly set `rights_status = approved`.

API image candidates remain external references and never count as `media_assets`. This keeps source discovery separate from Muuzee's human-approved, Storage-backed publication asset.

## Venue matching

The importer first reuses the venue already connected to the source record's exhibition. For new records it only reuses a venue when normalized name and normalized address are an exact match. If matching is uncertain, a duplicate venue is safer than a forced merge.
