import { fetchJson } from "@/lib/external/fetch-json";

type Metadata = Record<string, { value?: string }>;
type CommonsResponse = { query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{ url?: string; thumburl?: string; descriptionurl?: string; extmetadata?: Metadata }> }> } };

export function normalizeCommonsImageResponse(payload: CommonsResponse, fallbackTitle: string) {
  const page = Object.values(payload.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!page || !info?.url) return null;
  const meta = info.extmetadata || {};
  return {
    fileTitle: page.title || fallbackTitle,
    imageUrl: info.url,
    thumbnailUrl: info.thumburl || null,
    sourceUrl: info.descriptionurl || null,
    author: plainText(meta.Artist?.value || meta.Author?.value),
    credit: plainText(meta.Credit?.value),
    licenseShortName: plainText(meta.LicenseShortName?.value),
    licenseUrl: plainText(meta.LicenseUrl?.value),
    usageTerms: plainText(meta.UsageTerms?.value),
    raw: payload,
  };
}

export function plainText(value: string | null | undefined) {
  return (value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() || null;
}

export async function getCommonsImageMetadata(fileTitle: string) {
  const title = fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", titles: title, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "640", iiextmetadatalanguage: "ja", format: "json", origin: "*" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const payload = await fetchJson<CommonsResponse>(url);
  return normalizeCommonsImageResponse(payload, title);
}
