alter table public.import_runs
  add column if not exists source_hit_count integer not null default 0,
  add column if not exists scanned_count integer not null default 0;

-- requested_count is the exact number of eligible records after Muuzee's
-- day-level validation. source_hit_count and scanned_count preserve the
-- upstream search/scroll accounting separately.
