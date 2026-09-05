import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validUuid } from "@/lib/admin/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!validUuid(id)) throw new Error("Invalid venue ID");
    const { action } = await request.json();
    if (!["adopt", "reject"].includes(action)) throw new Error("Invalid action");
    const db = createSupabaseAdminClient();
    const { data: venue, error } = await db.from("venues").select("coordinate_candidate_latitude,coordinate_candidate_longitude,coordinate_candidate_source").eq("id", id).single();
    if (error || !venue) throw error || new Error("Venue not found");
    if (venue.coordinate_candidate_latitude == null || venue.coordinate_candidate_longitude == null) throw new Error("Coordinate candidate not found");
    const decidedAt = new Date().toISOString();
    const updates = action === "adopt"
      ? {
          latitude: venue.coordinate_candidate_latitude,
          longitude: venue.coordinate_candidate_longitude,
          coordinate_source: venue.coordinate_candidate_source,
          coordinate_precision: venue.coordinate_candidate_source === "geolonia" ? "town" : "exact",
          coordinate_status: "approved",
          coordinate_candidate_decided_at: decidedAt,
        }
      : { coordinate_status: "rejected", coordinate_candidate_decided_at: decidedAt };
    const { error: updateError } = await db.from("venues").update(updates).eq("id", id);
    if (updateError) throw updateError;
    revalidatePath("/admin/venues");
    revalidatePath(`/admin/venues/${id}`);
    return NextResponse.json({ message: action === "adopt" ? "座標Candidateを採用しました。" : "座標Candidateを却下しました。" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Coordinate candidate update failed" }, { status: 400 });
  }
}
