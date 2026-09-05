import { describe, expect, it } from "vitest";
import { resolveAddressParts } from "./client";

describe("Geolonia address fallback", () => {
  it("extracts prefecture, municipality, and locality only from a sufficient address", () => {
    expect(resolveAddressParts({ address: "東京都港区六本木7丁目22-2" })).toEqual({ prefecture: "東京都", city: "港区", locality: "六本木7丁目22-2" });
  });

  it("does not invent missing municipality data", () => {
    expect(resolveAddressParts({ address: "東京都" })).toEqual({ prefecture: "東京都", city: null, locality: "" });
  });
});
