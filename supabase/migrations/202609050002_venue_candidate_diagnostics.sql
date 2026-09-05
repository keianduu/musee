alter table public.venues
  add column if not exists best_wikidata_candidate_qid text,
  add column if not exists coordinate_status text not null default 'missing'
    check (coordinate_status in ('missing', 'candidate', 'approved', 'manual', 'rejected')),
  add column if not exists coordinate_candidate_qid text,
  add column if not exists coordinate_candidate_latitude numeric,
  add column if not exists coordinate_candidate_longitude numeric,
  add column if not exists coordinate_candidate_source text
    check (coordinate_candidate_source is null or coordinate_candidate_source in ('wikidata', 'geolonia')),
  add column if not exists coordinate_candidate_confidence numeric,
  add column if not exists coordinate_candidate_threshold numeric,
  add column if not exists coordinate_candidate_reason text,
  add column if not exists coordinate_candidate_distance_m numeric,
  add column if not exists coordinate_candidate_decided_at timestamptz,
  add column if not exists geolonia_candidate_latitude numeric,
  add column if not exists geolonia_candidate_longitude numeric,
  add column if not exists geolonia_candidate_precision text,
  add column if not exists coordinate_search_trace jsonb not null default '[]'::jsonb,
  add column if not exists image_search_status text not null default 'no_entity_candidate'
    check (image_search_status in ('no_entity_candidate', 'no_image_candidate', 'image_candidate_found', 'image_candidate_kept', 'image_candidate_rejected', 'approved_image_exists')),
  add column if not exists image_candidate_found_threshold numeric,
  add column if not exists image_candidate_found_confidence numeric,
  add column if not exists image_candidate_found_qid text,
  add column if not exists image_candidate_found_reason text,
  add column if not exists image_search_trace jsonb not null default '[]'::jsonb;

update public.venues
set coordinate_status = case
  when latitude is null or longitude is null then 'missing'
  when coordinate_source = 'manual' then 'manual'
  else 'approved'
end;

alter table public.source_image_candidates
  add column if not exists candidate_match_threshold numeric,
  add column if not exists candidate_kind text not null default 'reference'
    check (candidate_kind in ('reference', 'probable'));

comment on column public.venues.coordinate_status is
  'Entity match and coordinate decision are independent. Candidate coordinates require explicit human adoption.';
comment on column public.venues.image_search_trace is
  'Threshold-by-threshold P18 diagnostics. It never grants rights or publication eligibility.';
