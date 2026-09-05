alter table public.import_runs
  add column if not exists excluded_count integer not null default 0,
  add column if not exists date_from date,
  add column if not exists date_to date,
  add column if not exists include_past boolean not null default false;

create table if not exists public.source_image_candidates (
  id uuid primary key default gen_random_uuid(),
  source_record_id uuid not null references public.source_records(id) on delete cascade,
  image_url text not null,
  thumbnail_url text,
  provider text,
  contents_rights_type text,
  contents_access text,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'accepted', 'rejected')),
  is_active boolean not null default true,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (source_record_id, image_url)
);

create index if not exists source_image_candidates_source_idx
  on public.source_image_candidates (source_record_id, is_active);

alter table public.source_image_candidates enable row level security;

-- Source images are references for Admin review only. They are not copied to
-- Storage, made primary, or rights-approved by this migration/import flow.
