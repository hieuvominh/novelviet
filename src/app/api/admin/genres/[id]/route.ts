import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateGenre } from "@/app/admin/genres/actions";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id: genreId } = (await params) as { id: string };

  try {
    if (!genreId || !genreId.trim()) {
      return NextResponse.json({ success: false, error: "Genre ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check existence and deleted state
    const { data: existing, error: fetchErr } = await supabase
      .from("genres")
      .select("id, deleted_at")
      .eq("id", genreId)
      .maybeSingle();

    if (fetchErr) {
      const msg = fetchErr.message || JSON.stringify(fetchErr || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase.from("genres").select("id").eq("id", genreId).maybeSingle();
        if (fallback.error || !fallback.data) {
          return NextResponse.json({ success: false, error: "Genre not found" }, { status: 404 });
        }
      } else {
        return NextResponse.json({ success: false, error: fetchErr.message || "Failed to fetch genre" }, { status: 500 });
      }
    }

    if (existing && (existing as any).deleted_at) {
      return NextResponse.json({ success: false, error: "Genre is already deleted" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase.from("genres").update({ deleted_at: now }).eq("id", genreId);
    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message || "Failed to delete genre" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error deleting genre:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id: genreId } = (await params) as { id: string };
  try {
    const body = await req.json();
    const res = await updateGenre(genreId, body);
    if (!res.success) return NextResponse.json(res, { status: 400 });
    return NextResponse.json(res);
  } catch (err) {
    console.error("Error in PATCH /api/admin/genres/[id]:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unexpected" }, { status: 500 });
  }
}
