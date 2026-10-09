import { NextResponse } from "next/server";
import { fetchLeads, leadsToCsv, readFilters } from "@/lib/leads-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const filters = readFilters(new URL(req.url).searchParams);
  const { data, error } = await fetchLeads(filters, 10000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(leadsToCsv(data ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
