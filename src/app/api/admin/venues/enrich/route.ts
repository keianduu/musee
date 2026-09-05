import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { enrichVenueBatch } from "@/lib/venue-enrichment/service";

export async function POST(request: Request) {
  try { const body = await request.json(); const result = await enrichVenueBatch(Number(body.limit) || 20); revalidatePath("/admin/venues"); return NextResponse.json(result); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Venue enrichment failed" }, { status: 400 }); }
}
