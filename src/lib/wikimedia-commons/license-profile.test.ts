import { describe, expect, it } from "vitest";
import { interpretCommonsLicense } from "./license-profile";

describe("Commons license profile", () => {
  it("expands CC BY 3.0 into explicit usage conditions", () => {
    expect(interpretCommonsLicense("CC BY 3.0")).toEqual({
      license: "CC BY 3.0",
      usage: "利用可能",
      commercialUse: "可能",
      modification: "可能",
      attribution: "必要",
      shareAlike: "不要",
      recognized: true,
    });
  });

  it("keeps share-alike and non-commercial restrictions visible", () => {
    expect(interpretCommonsLicense("CC BY-NC-SA 4.0")).toMatchObject({
      usage: "利用可能（条件付き）",
      commercialUse: "不可",
      modification: "可能",
      attribution: "必要",
      shareAlike: "必要",
    });
  });

  it("normalizes CC0 and Public Domain without inventing attribution", () => {
    expect(interpretCommonsLicense("CC0 1.0")).toMatchObject({ usage: "利用可能", commercialUse: "可能", modification: "可能", attribution: "原則不要" });
    expect(interpretCommonsLicense("Public domain")).toMatchObject({ usage: "利用可能", attribution: "原則不要" });
  });

  it("does not infer conditions for an unknown or missing license", () => {
    expect(interpretCommonsLicense("Custom license")).toMatchObject({ recognized: false, usage: "不明", commercialUse: "不明" });
    expect(interpretCommonsLicense(null)).toMatchObject({ license: "記載なし・不明", recognized: false, usage: "不明" });
  });
});
