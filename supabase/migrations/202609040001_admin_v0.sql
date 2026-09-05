create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_en text,
  venue_type text not null default 'other'
    check (venue_type in ('museum', 'gallery', 'art_space', 'commercial_space', 'other')),
  postal_code text,
  prefecture text,
  city text,
  address text,
  latitude numeric,
  longitude numeric,
  normalized_name text not null,
  normalized_address text,
  official_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venues_normalized_identity_idx
  on public.venues (normalized_name, normalized_address);

create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  description text,
  exhibition_type text,
  official_url text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'ready', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exhibition_occurrences (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete restrict,
  start_date date,
  end_date date,
  opening_hours_text text,
  closed_days_text text,
  ticket_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exhibition_occurrences_exhibition_idx
  on public.exhibition_occurrences (exhibition_id);
create index exhibition_occurrences_venue_idx
  on public.exhibition_occurrences (venue_id);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  base_url text not null,
  terms_url text,
  metadata_license text,
  created_at timestamptz not null default now()
);

create table public.source_records (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid not null references public.data_sources(id) on delete restrict,
  external_id text not null,
  entity_type text not null,
  entity_id uuid references public.exhibitions(id) on delete set null,
  source_url text,
  raw_payload jsonb not null,
  checksum text,
  source_updated_at timestamptz,
  fetched_at timestamptz not null default now(),
  unique (data_source_id, external_id)
);

create index source_records_entity_idx
  on public.source_records (entity_type, entity_id);

create table public.import_runs (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid not null references public.data_sources(id) on delete restrict,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed', 'partial')),
  requested_count integer not null default 0,
  fetched_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  error_count integer not null default 0,
  errors jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  kind text not null default 'hero',
  storage_path text not null unique,
  original_filename text,
  source_type text
    check (source_type is null or source_type in ('artpr', 'official_press', 'organizer_press', 'open_collection', 'wikimedia', 'direct', 'other')),
  source_url text,
  credit text,
  usage_note text,
  rights_status text not null default 'pending'
    check (rights_status in ('pending', 'approved', 'rejected', 'needs_review')),
  rights_checked_at timestamptz,
  valid_until date,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index media_assets_one_primary_per_exhibition_idx
  on public.media_assets (exhibition_id)
  where is_primary;

create trigger venues_updated_at before update on public.venues
for each row execute function public.set_updated_at();
create trigger exhibitions_updated_at before update on public.exhibitions
for each row execute function public.set_updated_at();
create trigger exhibition_occurrences_updated_at before update on public.exhibition_occurrences
for each row execute function public.set_updated_at();
create trigger media_assets_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();

insert into public.data_sources (key, name, base_url, terms_url, metadata_license)
values (
  'art_commons_jpsearch',
  'Art Commons via Japan Search',
  'https://jpsearch.go.jp',
  'https://jpsearch.go.jp/static/developer/',
  'Source-specific; preserve provider metadata and verify before reuse'
)
on conflict (key) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  terms_url = excluded.terms_url,
  metadata_license = excluded.metadata_license;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exhibition-images',
  'exhibition-images',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.venues enable row level security;
alter table public.exhibitions enable row level security;
alter table public.exhibition_occurrences enable row level security;
alter table public.data_sources enable row level security;
alter table public.source_records enable row level security;
alter table public.import_runs enable row level security;
alter table public.media_assets enable row level security;

-- No public policies are created in Admin v0. Server-side service-role access only.
