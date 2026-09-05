import { describe, expect, it } from "vitest";
import { normalizeCommonsImageResponse, plainText } from "./client";

describe("Wikimedia Commons metadata", () => {
  it("normalizes HTML metadata without treating it as approval", () => {
    const normalized = normalizeCommonsImageResponse({ query: { pages: { "1": { title: "File:Museum.jpg", imageinfo: [{
      url: "https://upload.wikimedia.org/museum.jpg", thumburl: "https://upload.wikimedia.org/thumb.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Museum.jpg",
      extmetadata: { Artist: { value: "<b>Jane Doe</b>" }, Credit: { value: "Own work &amp; archive" }, LicenseShortName: { value: "CC BY-SA 4.0" } },
    }] } } } }, "File:fallback.jpg");
    expect(normalized?.author).toBe("Jane Doe");
    expect(normalized?.credit).toBe("Own work & archive");
    expect(normalized?.licenseShortName).toBe("CC BY-SA 4.0");
  });

  it("returns null when no downloadable image URL exists", () => {
    expect(normalizeCommonsImageResponse({ query: { pages: { "-1": { title: "File:Missing.jpg" } } } }, "File:Missing.jpg")).toBeNull();
  });

  it("strips common HTML entities", () => {
    expect(plainText("A<br>B&nbsp;&amp; C")).toBe("A\nB & C");
  });
});
