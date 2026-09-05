import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validUuid } from "@/lib/admin/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enrichVenue } from "@/lib/venue-enrichment/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; candidateId: string }> }) {
  try {
    const { id, candidateId } = await params; if (!validUuid(id) || !validUuid(candidateId)) throw new Error("Invalid ID"); const { action } = await request.json(); const db = createSupabaseAdminClient();
    const { data, error } = await db.from("venue_external_match_candidates").select("external_id").eq("id", candidateId).eq("venue_id", id).single(); if (error || !data) throw error || new Error("Candidate not found");
    if (action === "reject") { const { error: rejectError } = await db.from("venue_external_match_candidates").update({ status: "rejected" }).eq("id", candidateId); if (rejectError) throw rejectError; await db.from("venues").update({ wikidata_match_status: "rejected" }).eq("id", id); }
    else if (action === "adopt") await enrichVenue(id, { forceWikidataId: data.external_id }, db);
    else throw new Error("Invalid action");
    revalidatePath("/admin/venues"); revalidatePath(`/admin/venues/${id}`); return NextResponse.json({ message: action === "adopt" ? "Wikidata Entityを採用しました。" : "CandidateをRejectしました。" });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Match update failed" }, { status: 400 }); }
}
