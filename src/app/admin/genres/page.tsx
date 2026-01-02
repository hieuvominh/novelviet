import { createClient } from "@/lib/supabase/server";
import GenreList from "@/components/admin/genres/genre-list";

export default async function AdminGenresPage() {
  const supabase = await createClient();

  // Fetch genres excluding deleted ones; fallback if deleted_at missing
  let genres: { id: string; name: string; slug: string }[] = [];
  const res = await supabase
    .from("genres")
    .select("id, name, slug")
    .is("deleted_at", null);
  if (res.error) {
    const msg = res.error.message || JSON.stringify(res.error || "");
    if (msg.includes("deleted_at") || msg.includes("does not exist")) {
      const fallback = await supabase.from("genres").select("id, name, slug");
      if (!fallback.error && fallback.data) genres = fallback.data as any;
    } else {
      console.error("Error fetching genres:", res.error);
    }
  } else if (res.data) {
    genres = res.data as any;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Genres</h1>
        <a
          href="/admin/genres/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Genre
        </a>
      </div>

      <GenreList genres={genres} />
    </div>
  );
}
