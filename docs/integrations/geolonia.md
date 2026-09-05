# Geolonia Japanese Addresses integration

Status: Draft for Venue Enrichment v0.

Geolonia is a coordinate comparison/fallback candidate only when an existing Venue has no manual/approved coordinate and the Japanese address can be split into prefecture, municipality, and locality without guessing. It does not confirm a Wikidata entity and is not automatically adopted.

v0 reads the documented per-municipality JSON endpoint:

`https://japanese-addresses-v2.geoloniamaps.com/api/ja/{prefecture}/{city}.json`

The selected `point` is retained as a Geolonia candidate with `town` precision. When a Wikidata P625 candidate also exists, Admin shows both and the calculated distance. This is a locality representative point and must not be presented as a building entrance or exact facility position. Failure leaves the venue missing.

Official references:

- https://github.com/geolonia/japanese-addresses-v2
- https://github.com/geolonia/normalize-japanese-addresses
