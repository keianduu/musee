import { fetchJson } from "@/lib/external/fetch-json";

type AddressEntry = { oaza_cho?: string; chome?: string; point?: [number, number] };
type AddressResponse = { data?: AddressEntry[] };

const PREFECTURE_PATTERN = /^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)/;

export function resolveAddressParts(venue: { prefecture?: string | null; city?: string | null; address?: string | null }) {
  const address = (venue.address || "").normalize("NFKC").replace(/\s/g, "");
  const prefecture = venue.prefecture || address.match(PREFECTURE_PATTERN)?.[1] || null;
  const remaining = prefecture && address.startsWith(prefecture) ? address.slice(prefecture.length) : address;
  const city = venue.city || remaining.match(/^.+?(?:市|区|町|村)/)?.[0] || null;
  const locality = city && remaining.startsWith(city) ? remaining.slice(city.length) : remaining;
  return { prefecture, city, locality };
}

export async function geocodeWithGeolonia(venue: { prefecture?: string | null; city?: string | null; address?: string | null }) {
  const parts = resolveAddressParts(venue);
  if (!parts.prefecture || !parts.city || !parts.locality) return null;
  const url = `https://japanese-addresses-v2.geoloniamaps.com/api/ja/${encodeURIComponent(parts.prefecture)}/${encodeURIComponent(parts.city)}.json`;
  const payload = await fetchJson<AddressResponse>(url);
  const normalizedLocality = parts.locality.replace(/[0-9０-９]+丁目/g, (value) => value.normalize("NFKC"));
  const candidates = (payload.data || []).filter((entry) => entry.point && entry.oaza_cho && normalizedLocality.startsWith(entry.oaza_cho));
  candidates.sort((a, b) => `${b.oaza_cho || ""}${b.chome || ""}`.length - `${a.oaza_cho || ""}${a.chome || ""}`.length);
  const match = candidates.find((entry) => !entry.chome || normalizedLocality.includes(entry.chome)) || candidates[0];
  if (!match?.point) return null;
  return { longitude: match.point[0], latitude: match.point[1], precision: "town" as const, matchedLocality: `${match.oaza_cho || ""}${match.chome || ""}`, raw: payload };
}
