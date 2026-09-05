import type { ScoredWikidataCandidate } from "@/lib/wikidata/types";
import { findImageCandidates, MAX_REFERENCE_IMAGE_CANDIDATES } from "./policy";

export const MAX_UNCONFIRMED_IMAGE_CANDIDATES = MAX_REFERENCE_IMAGE_CANDIDATES;

export function selectWikidataImageCandidates(
  candidates: ScoredWikidataCandidate[],
  statuses: Map<string, string> = new Map(),
) {
  return findImageCandidates(candidates, statuses).candidates;
}
