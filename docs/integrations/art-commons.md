# Art Commons via Japan Search

Checked against the official Japan Search Easy Web API documentation and five live records on 2026-09-04.

## Official endpoints

- Theme search: `GET https://jpsearch.go.jp/api/item/search/exhib-default`
- Date-aware search: `GET https://jpsearch.go.jp/api/item/search/jps-cross` with `f-db=exhib` and `r-tempo={yearFrom},{yearTo}`
- Full-result scroll: `GET https://jpsearch.go.jp/api/item/scroll/jps-cross`; the first request uses the same filters and subsequent requests use `scrollId`
- Item detail: `GET https://jpsearch.go.jp/api/item/{itemId}`
- Database ID represented by the theme: `exhib`
- Parameters used by the legacy bounded search helper: `keyword`, `size`, `from`
- Parameters used by Admin full import: `keyword`, `f-db`, `r-tempo`, then `scrollId`
- Date-aware parameters: `f-db`, `r-tempo`. The Admin also applies exact day-level overlap filtering after the API year filter.

Official references:

- https://jpsearch.go.jp/static/developer/webapi/ja.html
- https://jpsearch.go.jp/static/developer/webapi/ch2_inquiry_api.html
- https://jpsearch.go.jp/static/developer/webapi/ch4_basic_param.html

## Observed search response

The top-level response contained `facets`, `from`, `hit`, and `list`. A request for `keyword=東京&size=5&from=0` returned five items from 8,009 matches at observation time.

Observed item IDs:

- `exhib-25564`
- `exhib-52858`
- `exhib-42739`
- `exhib-49278`
- `exhib-25725`

Search-list entries already contained `common`, `rdfindex`, and Art Commons fields, but the importer still retrieves Item Detail and stores that raw response.

## Observed detail fields

Common fields included:

- `common.id`, `common.title`, optional `common.titleEn`
- `common.location[]`
- `common.temporal[]`
- `common.linkUrl`
- `common.lastUpdatedDate`
- `common.coordinates`
- source/provider metadata

Art Commons-specific fields included:

- `exhib-名称-s`
- `exhib-名称英語等表記-s`
- `exhib-会場表記-s`
- `exhib-展示室等表記-s`
- `exhib-会期（始）-d`
- `exhib-会期（終）-d`
- `exhib-ホームページ-u`
- `exhib-URL-u`
- title/subtitle/organizer/category fields

## Mapping

| Muuzee field | Preferred source | Fallback |
| --- | --- | --- |
| title | `exhib-名称-s` | `common.title` |
| title_en | `exhib-名称英語等表記-s` | `common.titleEn` |
| venue name | `exhib-会場表記-s` | first `common.location` |
| start_date | `exhib-会期（始）-d` | first `common.temporal` |
| end_date | `exhib-会期（終）-d` | second `common.temporal` |
| official_url | `exhib-ホームページ-u` | null |
| source_url | `exhib-URL-u` | `common.linkUrl` |
| source_updated_at | `common.lastUpdatedDate` | null |

Dates are accepted only for explicit `YYYY/M/D`, `YYYY-MM-DD`, or `YYYY.MM.DD` values that form a valid calendar date. Anything ambiguous becomes null.

The source record keeps the provider's original venue/title/date strings and raw payload. Its explicit `exhibition_id` links a normalized record after import. Canonical venue display data is obtained through `exhibition_occurrences.venue_id`; the source venue string is not copied as a second venue master.

Re-import compares `(data_source_id, external_id)` and checksum. An unchanged linked source record is skipped, while a changed source record updates the existing Exhibition and Occurrence rather than creating duplicates.

## Date filtering

The Art Commons theme endpoint ignored `r-tempo` in a live check. Muuzee therefore uses Japan Search full-result scroll with `f-db=exhib` to preserve the Art Commons database boundary and `r-tempo` to narrow by year. The scroll snapshot is consumed until the API omits `scrollId`; every returned record is then checked for exact start/end-date overlap locally. The default is today through one year later. Past and undated records require an explicit Admin opt-in.

The normal `from` / `size` search is not used for Admin full import. Japan Search limits ordinary pagination to 2,000 results, while the documented scroll endpoint exists specifically for complete item retrieval and returns batches of 200.

## Source image candidates

The official common schema can expose `common.thumbnailUrl`, `common.contentsUrl`, `common.contentsRightsType`, and `common.contentsAccess`. When present, Muuzee stores only those URLs and source metadata in `source_image_candidates` for Admin review.

- The importer does not download or copy the remote image into Muuzee Storage.
- An API candidate is not a Primary image and never satisfies the publication rule.
- A human must verify the source and usage conditions, then upload an approved asset through Admin.
- The five original records and the tested current Art Commons results contained no image URLs, so a blank thumbnail remains correct for those records.

## Known limitations

- The five records did not provide description, postal address, opening hours, closed days, or ticket URL in stable fields. Muuzee stores null instead of guessing.
- `common.coordinates` may represent normalized place data and was visibly implausible for some venue names in the sample. v0 does not map it into the venue master.
- Source records can be old; the exact local date filter prevents out-of-window records from entering a normal import, but source freshness itself is not guaranteed.
- Source metadata does not grant Muuzee permission to use an image. Search or detail imagery is never promoted to `media_assets` automatically.
- Older official URLs may be HTTP or no longer resolve. They are retained as source metadata without claiming freshness.
