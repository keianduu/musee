alter table public.venues
  add column if not exists wikidata_id text,
  add column if not exists wikidata_match_status text not null default 'unmatched'
    check (wikidata_match_status in ('unmatched', 'candidate', 'matched', 'needs_review', 'rejected')),
  add column if not exists wikidata_match_confidence numeric,
  add column if not exists wikidata_match_reason text,
  add column if not exists coordinate_source text
    check (coordinate_source is null or coordinate_source in ('manual', 'wikidata', 'geolonia')),
  add column if not exists coordinate_precision text
    check (coordinate_precision is null or coordinate_precision in ('exact', 'building', 'residential', 'block', 'town', 'approximate')),
  add column if not exists enriched_at timestamptz;

alter table public.source_records
  add column if not exists venue_id uuid references public.venues(id) on delete cascade;

create index if not exists source_records_venue_idx
  on public.source_records (venue_id, data_source_id);

create table if not exists public.venue_external_match_candidates (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  provider text not null,
  external_id text not null,
  label_ja text,
  label_en text,
  description text,
  official_url text,
  latitude numeric,
  longitude numeric,
  image_file_title text,
  confidence numeric not null default 0,
  match_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'candidate'
    check (status in ('candidate', 'matched', 'needs_review', 'rejected')),
  raw_payload jsonb not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (venue_id, provider, external_id)
);

create index if not exists venue_match_candidates_venue_idx
  on public.venue_external_match_candidates (venue_id, status, confidence desc);

alter table public.source_image_candidates
  add column if not exists stable_identifier text,
  add column if not exists source_url text,
  add column if not exists author text,
  add column if not exists credit text,
  add column if not exists license_short_name text,
  add column if not exists license_url text,
  add column if not exists usage_terms text;

create unique index if not exists source_image_candidates_stable_idx
  on public.source_image_candidates (source_record_id, provider, stable_identifier);

alter table public.media_assets
  alter column exhibition_id drop not null,
  add column if not exists venue_id uuid references public.venues(id) on delete cascade;

alter table public.media_assets
  add constraint media_assets_exactly_one_owner_chk
  check (num_nonnulls(exhibition_id, venue_id) = 1);

create unique index if not exists media_assets_one_primary_per_venue_idx
  on public.media_assets (venue_id)
  where venue_id is not null and is_primary;

alter table public.import_runs
  add column if not exists operation_type text not null default 'exhibition_import',
  add column if not exists metrics jsonb;

insert into public.data_sources (key, name, base_url, terms_url, metadata_license)
values
  ('wikidata', 'Wikidata', 'https://www.wikidata.org', 'https://www.wikidata.org/wiki/Wikidata:Data_access', 'CC0'),
  ('wikimedia_commons', 'Wikimedia Commons', 'https://commons.wikimedia.org', 'https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia', 'Per-file license; human review required'),
  ('geolonia_addresses', 'Geolonia Japanese Addresses', 'https://japanese-addresses-v2.geoloniamaps.com', 'https://github.com/geolonia/japanese-addresses-v2', 'Open data; precision varies')
on conflict (key) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  terms_url = excluded.terms_url,
  metadata_license = excluded.metadata_license;

alter table public.venue_external_match_candidates enable row level security;
