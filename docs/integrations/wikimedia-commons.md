# Wikimedia Commons integration

Status: Draft for Venue Enrichment v0.

Muuzee walks the shared confidence thresholds from `0.95` down to `0.00` in `0.05` steps. At the first threshold whose eligible, non-rejected Wikidata entities contain P18, it records that threshold and calls Commons' MediaWiki Action API `imageinfo` with `url|extmetadata` and a 640px thumbnail request. It does not continue to lower thresholds after a hit. Unconfirmed candidates are capped at three per venue and remain reference images; their existence does not confirm the Wikidata entity.

Normalized fields include file title, original/thumbnail URL, Commons description page, author/artist, credit, license short name, license URL, and usage terms. `extmetadata` may contain HTML, so Admin receives plain text rather than rendering upstream markup.

Admin expands recognized reported license names into a review table: license, usage availability, commercial use, modification/cropping, attribution, and share-alike. For example, `CC BY 3.0` becomes usable, commercial use allowed, modification allowed, attribution required, and no share-alike requirement. CC BY-SA, CC BY-NC, CC BY-ND, CC0, and Public Domain conditions remain explicit. Unknown/custom/missing license names show `不明` for every condition instead of inferring permission. This table is an operational aid derived from the reported license, not a legal determination or Muuzee rights approval.

Candidates are external research references. Candidate relevance begins `unreviewed`; rights always begin `needs_review` (記載なし・不明), regardless of the reported license. Admin records rights as 明確に不可 (`rejected`), 記載なし・不明 (`needs_review`), or 明確に利用可能 (`approved`). Relevance and rights remain separate from approved Storage assets, and candidates never become Primary automatically. `(source_record_id, provider, stable_identifier)` deduplicates the same Commons file while allowing metadata refresh and preserving human decisions.

Official references:

- https://www.mediawiki.org/wiki/API:Imageinfo/en
- https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
