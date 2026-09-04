import { describe, expect, it } from "vitest";
import { mapArtCommonsItem, mapSourceImages, normalizeVenueIdentity, parseExplicitDate } from "./mapper";

describe("Art Commons mapper", () => {
  it("maps only confirmed fields and keeps absent values null", () => {
    const item = mapArtCommonsItem({ id: "exhib-25564", common: { title: "展覧会", location: ["東京都美術館"], temporal: ["2026-09-01", "2026-10-01"], lastUpdatedDate: 1780000000000 }, "exhib-ホームページ-u": "https://example.com" });
    expect(item).toMatchObject({ externalId: "exhib-25564", title: "展覧会", description: null, officialUrl: "https://example.com", venue: { name: "東京都美術館", address: null }, occurrence: { startDate: "2026-09-01", endDate: "2026-10-01", ticketUrl: null } });
  });
  it("does not guess ambiguous or impossible dates", () => {
    expect(parseExplicitDate("2026年9月")).toBeNull(); expect(parseExplicitDate("2026-02-30")).toBeNull(); expect(parseExplicitDate("2026/9/4")).toBe("2026-09-04");
  });
  it("normalizes venue identity without translating it", () => { expect(normalizeVenueIdentity("  東京都　美術館 ")).toBe("東京都 美術館"); });
  it("maps API image URLs as unapproved source candidates", () => {
    expect(mapSourceImages({ id: "exhib-image", common: { thumbnailUrl: ["https://example.com/thumb.jpg"], contentsUrl: ["https://example.com/image.jpg"], provider: "museum", contentsRightsType: "ccby", contentsAccess: "internet" } })).toEqual([{ imageUrl: "https://example.com/image.jpg", thumbnailUrl: "https://example.com/thumb.jpg", provider: "museum", contentsRightsType: "ccby", contentsAccess: "internet" }]);
  });
  it("rejects non-http image references", () => { expect(mapSourceImages({ id: "exhib-image", common: { thumbnailUrl: ["javascript:alert(1)"] } })).toEqual([]); });
});
