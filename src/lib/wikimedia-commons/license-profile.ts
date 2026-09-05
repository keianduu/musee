export type LicenseCondition = "可能" | "不可" | "必要" | "不要" | "原則不要" | "不明";

export type LicenseProfile = {
  license: string;
  usage: "利用可能" | "利用可能（条件付き）" | "利用不可" | "不明";
  commercialUse: LicenseCondition;
  modification: LicenseCondition;
  attribution: LicenseCondition;
  shareAlike: LicenseCondition;
  recognized: boolean;
};

const unknownProfile = (license: string): LicenseProfile => ({
  license,
  usage: "不明",
  commercialUse: "不明",
  modification: "不明",
  attribution: "不明",
  shareAlike: "不明",
  recognized: false,
});

/**
 * Turns common machine-reported license names into review aids for Admin.
 * This is intentionally conservative and is not a legal determination.
 */
export function interpretCommonsLicense(reportedLicense: string | null | undefined): LicenseProfile {
  const license = reportedLicense?.trim() || "記載なし・不明";
  const normalized = license.toUpperCase().replace(/[‐‑–—]/g, "-").replace(/\s+/g, " ");

  if (normalized === "CC0" || normalized.startsWith("CC0 ") || normalized.includes("PUBLIC DOMAIN")) {
    return { license, usage: "利用可能", commercialUse: "可能", modification: "可能", attribution: "原則不要", shareAlike: "不要", recognized: true };
  }

  if (normalized.includes("ALL RIGHTS RESERVED") || normalized.includes("COPYRIGHTED FREE USE") === false && normalized === "COPYRIGHTED") {
    return { license, usage: "利用不可", commercialUse: "不可", modification: "不可", attribution: "不明", shareAlike: "不明", recognized: true };
  }

  if (!/\bCC BY(?:-|\s|$)/.test(normalized)) return unknownProfile(license);

  const nonCommercial = normalized.includes("BY-NC") || normalized.includes("BY NC");
  const noDerivatives = normalized.includes("-ND") || normalized.includes(" ND");
  const shareAlike = normalized.includes("-SA") || normalized.includes(" SA");

  return {
    license,
    usage: nonCommercial || noDerivatives || shareAlike ? "利用可能（条件付き）" : "利用可能",
    commercialUse: nonCommercial ? "不可" : "可能",
    modification: noDerivatives ? "不可" : "可能",
    attribution: "必要",
    shareAlike: shareAlike ? "必要" : "不要",
    recognized: true,
  };
}
