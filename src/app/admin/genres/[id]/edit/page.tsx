import { createClient } from "@/lib/supabase/server";
import GenreForm from "@/components/admin/genres/genre-form";

type Props = { params: { id: string } };

export default async function EditGenrePage({ params }: Props) {
  const supabase = await createClient();
  const { id } = (await params) as { id: string };

  if (!id || typeof id !== "string" || !id.trim()) {
    return <div>Genre not found</div>;
  }

  let genre: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null = null;
  let fetchErrorMessage: string | null = null;
  // Try to fetch only non-deleted genres; fall back if deleted_at column missing
  const res = await supabase
    .from("genres")
    .select("id, name, slug, description")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (res.error) {
    const msg = res.error.message || JSON.stringify(res.error || "");
    // Keep a message for dev debugging
    fetchErrorMessage = msg;
    if (msg.includes("deleted_at") || msg.includes("does not exist")) {
      const fallback = await supabase
        .from("genres")
        .select("id, name, slug, description")
        .eq("id", id)
        .maybeSingle();
      if (fallback.error) {
        fetchErrorMessage =
          fallback.error.message || JSON.stringify(fallback.error || "");
      } else if (fallback.data) {
        genre = fallback.data as any;
      }
    } else {
      console.error("Error fetching genre:", res.error);
    }
  } else if (res.data) {
    genre = res.data as any;
  }

  if (!genre) {
    return (
      <div>
        <div>Genre not found</div>
        {process.env.NODE_ENV !== "production" && fetchErrorMessage ? (
          <pre className="mt-2 text-sm text-red-600">{fetchErrorMessage}</pre>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Genre</h1>
      </div>
      {/* @ts-expect-error Server -> Client */}
      <GenreForm initial={genre} mode="edit" />
    </div>
  );
}
