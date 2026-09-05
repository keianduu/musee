-- Muuzee Master Data Architecture
-- Keeps the low-frequency master enrichment pipeline separate from the
-- daily exhibition sync pipeline. Existing human decisions are preserved.

alter table public.venues
  add column name_native text,
  add column aliases text[] not null default '{}'::text[],
  add column country_code text
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  add column region text,
  add column district text,
  add column description text,
  add column access_text text,
  add column opening_hours_text text,
  add column closed_days_text text,
  add column opening_note text,
  add column publication_status text not null default 'draft'
    check (publication_status in ('draft', 'ready', 'published', 'archived')),
  add column is_active boolean not null default true;

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_en text,
  name_native text,
  name_kana text,
  aliases text[] not null default '{}'::text[],
  birth_date date,
  birth_year integer,
  death_date date,
  death_year integer,
  nationality_country_code text
    check (nationality_country_code is null or nationality_country_code ~ '^[A-Z]{2}$'),
  birth_country_code text
    check (birth_country_code is null or birth_country_code ~ '^[A-Z]{2}$'),
  birth_place text,
  description text,
  style_summary text,
  official_url text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'ready', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (birth_year is null or birth_year between -10000 and 9999),
  check (death_year is null or death_year between -10000 and 9999)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  title_original text,
  year_text text,
  created_year_from integer,
  created_year_to integer,
  description text,
  medium text,
  dimensions text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'ready', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (created_year_from is null or created_year_from between -10000 and 9999),
  check (created_year_to is null or created_year_to between -10000 and 9999),
  check (created_year_from is null or created_year_to is null or created_year_from <= created_year_to)
);

create table public.exhibition_artists (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete restrict,
  role text,
  sort_order integer,
  source_artist_name text,
  match_status text not null default 'matched'
    check (match_status in ('unmatched', 'candidate', 'matched', 'needs_review', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exhibition_id, artist_id)
);

create index exhibition_artists_artist_idx
  on public.exhibition_artists (artist_id, exhibition_id);

create table public.work_artists (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete restrict,
  role text,
  sort_order integer,
  created_at timestamptz not null default now(),
  unique (work_id, artist_id)
);

create index work_artists_artist_idx
  on public.work_artists (artist_id, work_id);

create table public.collection_holdings (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete restrict,
  work_id uuid not null references public.works(id) on delete restrict,
  holding_type text,
  inventory_number text,
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index collection_holdings_without_inventory_unique_idx
  on public.collection_holdings (venue_id, work_id)
  where inventory_number is null;

create unique index collection_holdings_with_inventory_unique_idx
  on public.collection_holdings (venue_id, work_id, inventory_number)
  where inventory_number is not null;

create index collection_holdings_work_idx
  on public.collection_holdings (work_id, venue_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('genre', 'movement', 'era', 'theme', 'other')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (type, slug)
);

create table public.artist_tags (
  artist_id uuid not null references public.artists(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (artist_id, tag_id)
);

create table public.venue_tags (
  venue_id uuid not null references public.venues(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (venue_id, tag_id)
);

create table public.work_tags (
  work_id uuid not null references public.works(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (work_id, tag_id)
);

create table public.exhibition_tags (
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (exhibition_id, tag_id)
);

-- source_records is the canonical external-ID and raw-payload ledger.
-- Explicit owner FKs preserve integrity while allowing audit-only records that
-- could not yet be normalized or matched to remain unlinked.
alter table public.source_records
  add column exhibition_id uuid references public.exhibitions(id) on delete set null,
  add column artist_id uuid references public.artists(id) on delete set null,
  add column work_id uuid references public.works(id) on delete set null;

update public.source_records
set exhibition_id = entity_id
where entity_type = 'exhibition' and entity_id is not null;

alter table public.source_records
  add constraint source_records_at_most_one_owner_chk
  check (num_nonnulls(exhibition_id, venue_id, artist_id, work_id) <= 1);

create index source_records_exhibition_idx
  on public.source_records (exhibition_id, data_source_id);
create index source_records_artist_idx
  on public.source_records (artist_id, data_source_id);
create index source_records_work_idx
  on public.source_records (work_id, data_source_id);

drop index public.source_records_entity_idx;
alter table public.source_records
  drop column entity_id,
  drop column entity_type;

alter table public.source_records
  drop constraint source_records_venue_id_fkey,
  add constraint source_records_venue_id_fkey
    foreign key (venue_id) references public.venues(id) on delete set null;

-- Confirmed Wikidata IDs are already retained with their scores and review
-- state in venue_external_match_candidates. Remove only the duplicated shortcut.
alter table public.venues drop column wikidata_id;

-- Field-level provenance tables deliberately use explicit owner FKs rather
-- than a polymorphic entity_id so master deletion cannot leave orphan rows.
create table public.venue_field_sources (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  source_record_id uuid references public.source_records(id) on delete set null,
  value_snapshot jsonb,
  generated_by_ai boolean not null default false,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'approved', 'rejected')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index venue_field_sources_current_idx
  on public.venue_field_sources (venue_id, field_name) where is_current;

create table public.artist_field_sources (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  source_record_id uuid references public.source_records(id) on delete set null,
  value_snapshot jsonb,
  generated_by_ai boolean not null default false,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'approved', 'rejected')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index artist_field_sources_current_idx
  on public.artist_field_sources (artist_id, field_name) where is_current;

create table public.work_field_sources (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  source_record_id uuid references public.source_records(id) on delete set null,
  value_snapshot jsonb,
  generated_by_ai boolean not null default false,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'approved', 'rejected')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index work_field_sources_current_idx
  on public.work_field_sources (work_id, field_name) where is_current;

create table public.exhibition_field_sources (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  source_record_id uuid references public.source_records(id) on delete set null,
  value_snapshot jsonb,
  generated_by_ai boolean not null default false,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'approved', 'rejected')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index exhibition_field_sources_current_idx
  on public.exhibition_field_sources (exhibition_id, field_name) where is_current;

-- One media table serves all four masters with explicit owner FKs.
alter table public.media_assets
  add column artist_id uuid references public.artists(id) on delete cascade,
  add column work_id uuid references public.works(id) on delete cascade,
  add column reported_license text,
  add column reported_license_url text,
  add column reported_author text,
  add column reported_usage_terms text;

update public.media_assets set rights_status = 'needs_review' where rights_status = 'pending';

alter table public.media_assets
  drop constraint media_assets_exactly_one_owner_chk,
  drop constraint media_assets_rights_status_check,
  add constraint media_assets_exactly_one_owner_chk
    check (num_nonnulls(exhibition_id, venue_id, artist_id, work_id) = 1),
  add constraint media_assets_rights_status_check
    check (rights_status in ('approved', 'rejected', 'needs_review'));

create unique index media_assets_one_primary_per_artist_idx
  on public.media_assets (artist_id) where artist_id is not null and is_primary;
create unique index media_assets_one_primary_per_work_idx
  on public.media_assets (work_id) where work_id is not null and is_primary;

create trigger artists_updated_at before update on public.artists
for each row execute function public.set_updated_at();
create trigger works_updated_at before update on public.works
for each row execute function public.set_updated_at();
create trigger exhibition_artists_updated_at before update on public.exhibition_artists
for each row execute function public.set_updated_at();
create trigger collection_holdings_updated_at before update on public.collection_holdings
for each row execute function public.set_updated_at();
create trigger venue_field_sources_updated_at before update on public.venue_field_sources
for each row execute function public.set_updated_at();
create trigger artist_field_sources_updated_at before update on public.artist_field_sources
for each row execute function public.set_updated_at();
create trigger work_field_sources_updated_at before update on public.work_field_sources
for each row execute function public.set_updated_at();
create trigger exhibition_field_sources_updated_at before update on public.exhibition_field_sources
for each row execute function public.set_updated_at();

alter table public.artists enable row level security;
alter table public.works enable row level security;
alter table public.exhibition_artists enable row level security;
alter table public.work_artists enable row level security;
alter table public.collection_holdings enable row level security;
alter table public.tags enable row level security;
alter table public.artist_tags enable row level security;
alter table public.venue_tags enable row level security;
alter table public.work_tags enable row level security;
alter table public.exhibition_tags enable row level security;
alter table public.venue_field_sources enable row level security;
alter table public.artist_field_sources enable row level security;
alter table public.work_field_sources enable row level security;
alter table public.exhibition_field_sources enable row level security;

comment on table public.source_records is
  'External ID and latest raw source payload ledger. A record may be unlinked while normalization or matching is unresolved.';
comment on table public.venue_field_sources is
  'Field-level provenance and human review history for the venue master.';
comment on table public.artist_field_sources is
  'Field-level provenance and human review history for the artist master.';
comment on table public.work_field_sources is
  'Field-level provenance and human review history for the work master.';
comment on table public.exhibition_field_sources is
  'Field-level provenance and human review history for the exhibition master.';
