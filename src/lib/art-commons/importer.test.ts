import { describe, expect, it } from "vitest";
import { checksumPayload, defaultImportDateRange, hasMinimumImportFields, matchesImportDateRange, shouldSkipExistingRecord } from "./importer";

describe("import idempotency", () => {
  it("produces stable checksums for the same source JSON", () => { const value = { id: "exhib-1", common: { title: "A" } }; expect(checksumPayload(value)).toBe(checksumPayload(value)); });
  it("skips only a linked record with an unchanged checksum", () => { const existing = { id: "source-1", entity_id: "exhibition-1", checksum: "same" }; expect(shouldSkipExistingRecord(existing, "same")).toBe(true); expect(shouldSkipExistingRecord(existing, "changed")).toBe(false); expect(shouldSkipExistingRecord({ ...existing, entity_id: null }, "same")).toBe(false); });
  it("defaults to today through one year in Japan", () => { expect(defaultImportDateRange(new Date("2026-09-03T16:00:00Z"))).toEqual({ dateFrom: "2026-09-04", dateTo: "2027-09-04" }); });
  it("keeps only records overlapping the requested dates", () => { expect(matchesImportDateRange({ id: "current", common: { temporal: ["2026/8/1", "2026/9/30"] } }, "2026-09-04", "2027-09-04")).toBe(true); expect(matchesImportDateRange({ id: "past", common: { temporal: ["2015/1/1", "2015/2/1"] } }, "2026-09-04", "2027-09-04")).toBe(false); expect(matchesImportDateRange({ id: "unknown", common: {} }, "2026-09-04", "2027-09-04")).toBe(false); });
  it("excludes source results that cannot form an exhibition", () => { expect(hasMinimumImportFields({ id: "ok", common: { title: "展覧会", location: ["会場"] } })).toBe(true); expect(hasMinimumImportFields({ id: "missing", common: { title: "展覧会" } })).toBe(false); });
});
