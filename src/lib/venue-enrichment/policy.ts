import type { ScoredWikidataCandidate } from "@/lib/wikidata/types";

export const ENTITY_AUTO_MATCH_THRESHOLD = 0.85;
export const ENTITY_REVIEW_THRESHOLD = 0.6;
export const CANDIDATE_MIN_THRESHOLD = 0;
export const ENRICHMENT_THRESHOLD_STEPS = [
  0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6,
  0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0,
] as const;
export const MAX_REFERENCE_IMAGE_CANDIDATES = 3;

export type SearchTraceStep = {
  threshold: number;
  eligibleCount: number;
  availableCount: number;
  result: "not_found" | "found";
  qid?: string;
};

function allowed(candidate: ScoredWikidataCandidate, statuses: Map<string, string>) {
  return statuses.get(candidate.id) !== "rejected";
}

export function thresholdForConfidence(confidence: number) {
  return ENRICHMENT_THRESHOLD_STEPS.find((threshold) => confidence >= threshold) ?? null;
}

export function findCoordinateCandidate(candidates: ScoredWikidataCandidate[], statuses: Map<string, string> = new Map()) {
  const candidate = candidates.find((item) =>
    allowed(item, statuses)
    && item.confidence >= CANDIDATE_MIN_THRESHOLD
    && item.latitude != null
    && item.longitude != null,
  );
  return candidate ? { candidate, threshold: thresholdForConfidence(candidate.confidence) } : null;
}

export function findImageCandidates(candidates: ScoredWikidataCandidate[], statuses: Map<string, string> = new Map()) {
  const trace: SearchTraceStep[] = [];
  for (const threshold of ENRICHMENT_THRESHOLD_STEPS) {
    const eligible = candidates.filter((item) => allowed(item, statuses) && item.confidence >= threshold);
    const withImage = eligible.filter((item) => Boolean(item.imageFileTitle));
    trace.push({
      threshold,
      eligibleCount: eligible.length,
      availableCount: withImage.length,
      result: withImage.length ? "found" : "not_found",
      qid: withImage[0]?.id,
    });
    if (withImage.length) {
      return {
        candidates: withImage.slice(0, MAX_REFERENCE_IMAGE_CANDIDATES),
        foundThreshold: threshold,
        trace,
      };
    }
  }
  return { candidates: [] as ScoredWikidataCandidate[], foundThreshold: null, trace };
}

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6_371_000;
  const deltaLatitude = radians(b.latitude - a.latitude);
  const deltaLongitude = radians(b.longitude - a.longitude);
  const value = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(value)));
}
