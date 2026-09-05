/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { VenueEnrichmentForm } from "@/components/admin/venue-enrichment-form";
import { getVenues } from "@/lib/admin/queries";

type Venue = Awaited<ReturnType<typeof getVenues>>["data"][number];

function imageState(venue: Venue) {
  const approved = venue.media_assets?.some((asset) => asset.rights_status === "approved");
  const candidates = venue.source_records?.flatMap((source) => source.source_image_candidates || []).filter((item) => item.is_active) || [];
  if (approved) return { key: "approved", label: "Approved画像あり" };
  if (candidates.some((item) => item.review_status === "accepted")) return { key: "kept", label: "Candidate保持" };
  const waiting = candidates.filter((item) => item.review_status === "unreviewed");
  if (waiting.length) {
    const relaxed = waiting.some((item) => (item.candidate_match_threshold ?? 1) < 0.85);
    return { key: relaxed ? "relaxed" : "waiting", label: relaxed ? "閾値緩和でCandidate取得" : "Candidate確認待ち" };
  }
  if (candidates.length && candidates.every((item) => item.review_status === "rejected")) return { key: "rejected", label: "Candidate却下" };
  if (venue.image_search_status === "no_entity_candidate") return { key: "no_entity", label: "画像なし（Entity候補なし）" };
  return { key: "missing", label: "閾値内画像なし" };
}

function coordinateState(venue: Venue) {
  const labels = { missing: "座標なし", candidate: "Candidate確認待ち", approved: "Approved", manual: "Manual", rejected: "Candidate却下" };
  return labels[venue.coordinate_status] || venue.coordinate_status;
}

export default async function VenuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const query = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const result = await getVenues();
  const rows = result.data.filter((venue) => {
    const image = imageState(venue);
    const filterMatches = filter === "all"
      || (filter === "coordinate_missing" && venue.coordinate_status === "missing")
      || (filter === "coordinate_candidate" && venue.coordinate_status === "candidate")
      || (filter === "image_missing" && ["missing", "no_entity"].includes(image.key))
      || (filter === "image_relaxed" && image.key === "relaxed")
      || (filter === "candidate_waiting" && ["waiting", "relaxed", "kept"].includes(image.key))
      || (filter === "wikidata_review" && ["candidate", "needs_review"].includes(venue.wikidata_match_status))
      || (filter === "approved_image" && image.key === "approved");
    return filterMatches && (!query || `${venue.name} ${venue.address || ""}`.toLowerCase().includes(query));
  });

  return <>
    <div className="page-head"><div><p className="eyebrow">Venue master</p><h1>Venues</h1></div></div>
    {result.error && <div className="error">{result.error}</div>}
    <VenueEnrichmentForm />
    <form className="toolbar">
      <div className="field"><label htmlFor="q">Venue / Address</label><input id="q" name="q" defaultValue={query}/></div>
      <div className="field"><label htmlFor="filter">Filter</label><select id="filter" name="filter" defaultValue={filter}>
        <option value="all">All</option><option value="coordinate_missing">座標なし</option><option value="coordinate_candidate">座標Candidate確認待ち</option>
        <option value="image_missing">画像なし</option><option value="image_relaxed">閾値緩和で画像Candidate取得</option><option value="candidate_waiting">画像Candidate確認待ち</option>
        <option value="wikidata_review">Wikidata Match要確認</option><option value="approved_image">Approved画像あり</option>
      </select></div>
      <button className="button secondary">Filter</button>
    </form>
    <div className="table-wrap"><table><thead><tr><th>Image</th><th>Venue</th><th>Address</th><th>Coordinate status</th><th>Image status</th><th>Best match</th><th>Coordinate candidate / level</th><th>Image found level</th><th>Updated</th></tr></thead><tbody>
      {rows.map((venue) => {
        const primary = venue.media_assets?.find((asset) => asset.is_primary);
        const candidate = venue.source_records?.flatMap((source) => source.source_image_candidates || []).find((item) => item.is_active && item.review_status !== "rejected");
        const thumbnail = primary?.signedUrl || candidate?.thumbnail_url || candidate?.image_url;
        const image = imageState(venue);
        return <tr key={venue.id}>
          <td>{thumbnail ? <img className="thumb" src={thumbnail} alt=""/> : <span className="thumb"/>}</td>
          <td><Link href={`/admin/venues/${venue.id}`}><strong>{venue.name}</strong></Link></td><td>{venue.address || "-"}</td>
          <td><span className={`status ${["approved", "manual"].includes(venue.coordinate_status) ? "approved" : ""}`}>{coordinateState(venue)}</span></td>
          <td><span className={`status ${image.key === "approved" ? "approved" : ""}`}>{image.label}</span></td>
          <td>{venue.wikidata_match_confidence ?? "-"}<br/><span className="muted">{venue.best_wikidata_candidate_qid || "候補なし"}</span></td>
          <td>{venue.coordinate_candidate_confidence ?? "-"}<br/><span className="muted">threshold {venue.coordinate_candidate_threshold ?? "-"} / {venue.coordinate_candidate_source || "候補なし"}</span></td>
          <td>{venue.image_candidate_found_threshold ?? "-"}<br/><span className="muted">{venue.image_candidate_found_qid || "候補なし"}</span></td>
          <td>{new Date(venue.updated_at).toLocaleString("ja-JP")}</td>
        </tr>;
      })}
      {!rows.length && <tr><td colSpan={9} className="muted">条件に合うVenueはありません。</td></tr>}
    </tbody></table></div>
  </>;
}
