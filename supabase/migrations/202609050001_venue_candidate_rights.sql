alter table public.source_image_candidates
  add column if not exists rights_status text not null default 'needs_review'
    check (rights_status in ('rejected', 'needs_review', 'approved')),
  add column if not exists candidate_entity_id text,
  add column if not exists candidate_entity_label text,
  add column if not exists candidate_match_confidence numeric;

-- External candidates remain research references. Even an approved rights
-- judgment does not turn a candidate into a Storage asset or Primary image.
update public.source_image_candidates
set rights_status = 'rejected'
where review_status = 'rejected';
