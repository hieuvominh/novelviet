import { createClient } from "@/lib/supabase/server";
import NovelForm from "@/components/admin/novel-form";

export default async function AdminNovelNew() {
  const supabase = await createClient();

  // Log user/session info for debugging why authors may be empty
  try {
    const userResp = await supabase.auth.getUser();
    // eslint-disable-next-line no-console
    console.log("[AdminNovelNew] supabase user:", userResp);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[AdminNovelNew] error fetching user:", e);
  }

  // Fetch authors with deleted_at fallback
  let authors: any[] = [];
  try {
    const res = await supabase
      .from("authors")
      .select("id, name")
      .is("deleted_at", null)
      .order("name");
    // eslint-disable-next-line no-console
    console.log("[AdminNovelNew] authors res:", res);
    if (res.error) {
      const msg = res.error.message || JSON.stringify(res.error || "");
      if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
        throw res.error;
      }

      // Fallback query when deleted_at column doesn't exist
      const res2 = await supabase
        .from("authors")
        .select("id, name")
        .order("name");
      // eslint-disable-next-line no-console
      console.log("[AdminNovelNew] authors fallback res:", res2);
      authors = res2.data || [];
    } else {
      authors = res.data || [];
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[AdminNovelNew] unexpected error fetching authors:", err);
    authors = [];
  }

  // Fetch genres with deleted_at fallback
  let genres: any[] = [];
  try {
    const res = await supabase
      .from("genres")
      .select("id, name")
      .is("deleted_at", null)
      .order("name");
    if (res.error) {
      const msg = res.error.message || JSON.stringify(res.error || "");
      if (!msg.includes("deleted_at") && !msg.includes("does not exist"))
        throw res.error;

      // Fallback when deleted_at doesn't exist
      const res2 = await supabase
        .from("genres")
        .select("id, name")
        .order("name");
      genres = res2.data || [];
    } else {
      genres = res.data || [];
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[AdminNovelNew] unexpected error fetching genres:", err);
    genres = [];
  }

  return (
    <NovelForm mode="create" initialAuthors={authors} initialGenres={genres} />
  );
}
