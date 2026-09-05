import { describe, expect, it, vi } from "vitest";
import { processVenueEnrichmentItems } from "./batch";
import type { VenueEnrichmentResult } from "./types";

const success = (id: string): VenueEnrichmentResult => ({
  venueId: id, venueName: id, matchStatus: "matched", wikidataId: "Q1", confidence: 0.9,
  coordinateAdded: false, coordinateSource: null, coordinateCandidateFound: true, imageCandidateAdded: true,
  imageCandidateFound: true, imageFoundAtRelaxedThreshold: false, entityCandidateFound: true,
});

describe("venue enrichment batch", () => {
  it("continues after an item failure and reports a partial result", async () => {
    const enrich = vi.fn(async (id: string) => {
      if (id === "bad") throw new Error("rate limited");
      return success(id);
    });
    const result = await processVenueEnrichmentItems([{ id: "good", name: "Good" }, { id: "bad", name: "Bad" }], enrich, async () => undefined);
    expect(result.processed).toBe(2);
    expect(result.matched).toBe(1);
    expect(result.errors).toEqual([{ venueId: "bad", venueName: "Bad", message: "rate limited" }]);
  });

  it("can retry a previously failed item without duplicating batch state", async () => {
    let attempts = 0;
    const enrich = vi.fn(async (id: string) => {
      attempts += 1;
      if (attempts === 1) throw new Error("temporary failure");
      return success(id);
    });
    const venues = [{ id: "retry", name: "Retry" }];
    const first = await processVenueEnrichmentItems(venues, enrich, async () => undefined);
    const second = await processVenueEnrichmentItems(venues, enrich, async () => undefined);
    expect(first.errors).toHaveLength(1);
    expect(second.errors).toHaveLength(0);
    expect(second.matched).toBe(1);
  });
});
