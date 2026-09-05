import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueEditor } from "@/components/admin/venue-editor";
import { createVenueImageResearchPrompt } from "@/lib/admin/venue-image-research-prompt";
import { firstRelation, getVenue } from "@/lib/admin/queries";

export default async function VenueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const result = await getVenue(id); if (result.configured && !result.data && !result.error) notFound();
  if (!result.data) return <><h1>Venue</h1><div className={result.error ? "error" : "notice"}>{result.error || "Supabase環境変数が未設定です。"}</div></>;
  const venue = result.data; const prompt = createVenueImageResearchPrompt({ name: venue.name, address: venue.address, officialUrl: venue.official_url });
  return <><div className="page-head"><div><p className="eyebrow">{venue.wikidata_match_status}</p><h1>{venue.name}</h1></div></div><VenueEditor venue={venue} prompt={prompt}/><section><h2>External Sources</h2>{(venue.source_records || []).map((source) => <details className="card" key={source.id}><summary>{firstRelation(source.data_sources)?.name || "Source"} / {source.external_id}</summary><p><a href={source.source_url || "#"} target="_blank" rel="noreferrer">Source URL</a> · fetched {source.fetched_at}</p></details>)}</section><section><h2>関連展覧会</h2><div className="card">{(venue.exhibition_occurrences || []).map((occurrence) => { const exhibition = firstRelation(occurrence.exhibitions); return exhibition ? <p key={occurrence.id}><Link href={`/admin/exhibitions/${exhibition.id}`}>{exhibition.title}</Link> <span className="muted">{occurrence.start_date || "?"} – {occurrence.end_date || "?"}</span></p> : null; })}{!venue.exhibition_occurrences?.length && <p className="muted">関連展覧会はありません。</p>}</div></section></>;
}
