import { describe, expect, it } from "vitest";
import { createImageResearchPrompt } from "./image-research-prompt";

describe("image research prompt", () => {
  it("classifies every candidate on the approved three-axis scale", () => {
    const prompt = createImageResearchPrompt({
      title: "展覧会",
      venue: "美術館",
      startDate: "2026-09-01",
      endDate: "2026-10-01",
      officialUrl: null,
    });
    expect(prompt).toContain("明確に再配布NGとされている");
    expect(prompt).toContain("表記がなく判断がつかない");
    expect(prompt).toContain("配布OKとされている");
    expect(prompt).toContain("禁止の明示がないことだけを理由に「配布OK」としない");
    expect(prompt).toContain("許可表記が見つからないことだけを理由に「再配布NG」とせず");
  });
});
