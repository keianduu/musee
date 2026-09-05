import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validUuid } from "@/lib/admin/http";
import { enrichVenue } from "@/lib/venue-enrichment/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; if (!validUuid(id)) throw new Error("Invalid venue ID"); const result = await enrichVenue(id); revalidatePath("/admin/venues"); revalidatePath(`/admin/venues/${id}`); return NextResponse.json({ message: "Venue情報を補完しました。", ...result }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Venue enrichment failed" }, { status: 400 }); }
}
