import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { assertHttpUrl, nullableText, validUuid } from "@/lib/admin/http";
import { normalizeVenueIdentity } from "@/lib/art-commons/mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function nullableNumber(value: unknown) { if (value == null || value === "") return null; const number = Number(value); if (!Number.isFinite(number)) throw new Error("Invalid coordinate"); return number; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; if (!validUuid(id)) throw new Error("Invalid venue ID"); const body = await request.json(); const name = nullableText(body.name); if (!name) throw new Error("Nameは必須です。"); const db = createSupabaseAdminClient();
    const officialUrl = nullableText(body.official_url); assertHttpUrl(officialUrl, "Official URL"); const latitude = nullableNumber(body.latitude); const longitude = nullableNumber(body.longitude); if ((latitude == null) !== (longitude == null)) throw new Error("LatitudeとLongitudeは両方入力してください。");
    const { data: current, error: currentError } = await db.from("venues").select("latitude,longitude,coordinate_source,coordinate_precision,coordinate_candidate_latitude,coordinate_candidate_longitude").eq("id", id).single(); if (currentError || !current) throw currentError || new Error("Venue not found");
    const values: Record<string, unknown> = { name, name_en: nullableText(body.name_en), venue_type: nullableText(body.venue_type) || "other", postal_code: nullableText(body.postal_code), prefecture: nullableText(body.prefecture), city: nullableText(body.city), address: nullableText(body.address), official_url: officialUrl, normalized_name: normalizeVenueIdentity(name), normalized_address: normalizeVenueIdentity(nullableText(body.address)) || null, latitude, longitude };
    const currentLatitude = current.latitude == null ? null : Number(current.latitude); const currentLongitude = current.longitude == null ? null : Number(current.longitude);
    const coordinatesChanged = currentLatitude !== latitude || currentLongitude !== longitude;
    if (coordinatesChanged && latitude != null && longitude != null) { values.coordinate_source = "manual"; values.coordinate_precision = "exact"; values.coordinate_status = "manual"; values.coordinate_candidate_decided_at = new Date().toISOString(); }
    else if (coordinatesChanged) { values.coordinate_source = null; values.coordinate_precision = null; values.coordinate_status = current.coordinate_candidate_latitude != null && current.coordinate_candidate_longitude != null ? "candidate" : "missing"; }
    const { error } = await db.from("venues").update(values).eq("id", id); if (error) throw error;
    revalidatePath("/admin/venues"); revalidatePath(`/admin/venues/${id}`); return NextResponse.json({ message: "Venue情報を保存しました。" });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Save failed" }, { status: 400 }); }
}
