import { fetchJson } from "@/lib/external/fetch-json";
import type { WikidataVenueCandidate } from "./types";

type SearchResponse = { search?: Array<{ id: string }> };
type Snak = { mainsnak?: { datavalue?: { value?: unknown } } };
type Entity = { labels?: Record<string, { value: string }>; aliases?: Record<string, Array<{ value: string }>>; descriptions?: Record<string, { value: string }>; claims?: Record<string, Snak[]> };
type EntitiesResponse = { entities?: Record<string, Entity> };

function claimValue(entity: Entity, property: string): unknown {
  return entity.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
}

function entityId(value: unknown) {
  return value && typeof value === "object" && "id" in value ? String((value as { id: unknown }).id) : null;
}

export async function getWikidataEntities(ids: string[]): Promise<WikidataVenueCandidate[]> {
  if (!ids.length) return [];
  const url = new URL("https://www.wikidata.org/w/api.php");
  Object.entries({ action: "wbgetentities", ids: ids.join("|"), props: "labels|descriptions|aliases|claims", languages: "ja|en", format: "json", origin: "*" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const payload = await fetchJson<EntitiesResponse>(url);
  return ids.flatMap((id) => {
    const entity = payload.entities?.[id];
    if (!entity) return [];
    const coordinate = claimValue(entity, "P625") as { latitude?: number; longitude?: number } | undefined;
    const website = claimValue(entity, "P856");
    const image = claimValue(entity, "P18");
    return [{
      id,
      labelJa: entity.labels?.ja?.value || null,
      labelEn: entity.labels?.en?.value || null,
      aliases: [...(entity.aliases?.ja || []), ...(entity.aliases?.en || [])].map((item) => item.value),
      description: entity.descriptions?.ja?.value || entity.descriptions?.en?.value || null,
      officialUrl: typeof website === "string" ? website : null,
      latitude: typeof coordinate?.latitude === "number" ? coordinate.latitude : null,
      longitude: typeof coordinate?.longitude === "number" ? coordinate.longitude : null,
      imageFileTitle: typeof image === "string" ? image : null,
      countryId: entityId(claimValue(entity, "P17")),
      raw: entity,
    }];
  });
}

export async function searchWikidataVenues(name: string, limit = 5) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  Object.entries({ action: "wbsearchentities", search: name, language: "ja", uselang: "ja", type: "item", limit: String(limit), format: "json", origin: "*" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const payload = await fetchJson<SearchResponse>(url);
  return getWikidataEntities((payload.search || []).map((item) => item.id));
}
