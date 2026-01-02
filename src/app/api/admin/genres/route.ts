import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGenre } from "@/app/admin/genres/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await createGenre(body);
    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (err) {
    console.error("Error in POST /api/admin/genres:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unexpected" }, { status: 500 });
  }
}
