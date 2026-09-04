import { NextResponse } from "next/server";
import { importArtCommons } from "@/lib/art-commons/importer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await importArtCommons({ keyword: String(body.keyword || ""), dateFrom: typeof body.dateFrom === "string" ? body.dateFrom : null, dateTo: typeof body.dateTo === "string" ? body.dateTo : null, includePast: body.includePast === true });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 500 });
  }
}
