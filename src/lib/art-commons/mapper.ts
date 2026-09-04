import type { ArtCommonsItem, NormalizedArtCommonsItem } from "./types";

const field = (item: ArtCommonsItem, key: string) => {
  const value = item[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

export function parseExplicitDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function normalizeVenueIdentity(value: string | null | undefined) {
  return (value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\s　]+/g, " ")
    .trim();
}

function sourceUpdatedAt(item: ArtCommonsItem) {
  const value = item.common?.lastUpdatedDate;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function safeHttpUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function mapSourceImages(item: ArtCommonsItem) {
  const thumbnails = Array.isArray(item.common?.thumbnailUrl) ? item.common.thumbnailUrl : [];
  const contents = Array.isArray(item.common?.contentsUrl) ? item.common.contentsUrl : [];
  const count = Math.max(thumbnails.length, contents.length);
  const candidates = Array.from({ length: count }, (_, index) => {
    const thumbnailUrl = safeHttpUrl(thumbnails[index] || thumbnails[0]);
    const contentUrl = safeHttpUrl(contents[index]);
    const imageUrl = contentUrl || thumbnailUrl;
    if (!imageUrl) return null;
    return {
      imageUrl,
      thumbnailUrl,
      provider: item.common?.provider?.trim() || null,
      contentsRightsType: item.common?.contentsRightsType?.trim() || null,
      contentsAccess: item.common?.contentsAccess?.trim() || null,
    };
  });
  return candidates.filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));
}

export function mapArtCommonsItem(item: ArtCommonsItem): NormalizedArtCommonsItem {
  const title = field(item, "exhib-名称-s") || item.common?.title?.trim();
  const venue = field(item, "exhib-会場表記-s") || item.common?.location?.[0]?.trim();
  if (!item.id || !title || !venue) {
    throw new Error(`Art Commons item ${item.id || "(unknown)"} lacks title or venue`);
  }
  const temporal = item.common?.temporal || [];
  return {
    externalId: item.id,
    title,
    titleEn: field(item, "exhib-名称英語等表記-s") || item.common?.titleEn?.trim() || null,
    description: null,
    exhibitionType: field(item, "exhib-カテゴリ-s"),
    officialUrl: field(item, "exhib-ホームページ-u"),
    sourceUrl: field(item, "exhib-URL-u") || item.common?.linkUrl?.trim() || null,
    sourceUpdatedAt: sourceUpdatedAt(item),
    sourceImages: mapSourceImages(item),
    venue: { name: venue, address: null },
    occurrence: {
      startDate: parseExplicitDate(field(item, "exhib-会期（始）-d") || temporal[0]),
      endDate: parseExplicitDate(field(item, "exhib-会期（終）-d") || temporal[1]),
      openingHoursText: null,
      closedDaysText: null,
      ticketUrl: null,
    },
  };
}
