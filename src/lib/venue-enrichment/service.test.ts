import { describe, expect, it } from "vitest";
import { canApplyAutomaticCoordinates } from "./service";

describe("venue enrichment protections", () => {
  it("allows automatic coordinates only when both values and their source are empty", () => {
    expect(canApplyAutomaticCoordinates({ latitude: null, longitude: null, coordinate_source: null })).toBe(true);
  });

  it.each([
    { latitude: 35, longitude: 139, coordinate_source: "manual" },
    { latitude: 35, longitude: 139, coordinate_source: null },
    { latitude: null, longitude: null, coordinate_source: "manual" },
  ])("protects existing/manual coordinates: %o", (venue) => {
    expect(canApplyAutomaticCoordinates(venue)).toBe(false);
  });
});
