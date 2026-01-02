"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateGenreInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface CreateGenreResult {
  success: boolean;
  error?: string;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    // Normalize unicode (remove accents)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    // Replace non-alphanumeric characters with dashes
    .replace(/[^a-z0-9]+/g, "-")
    // Collapse multiple dashes
    .replace(/-+/g, "-")
    // Trim leading/trailing dashes
    .replace(/^-|-$/g, "");
}

export async function createGenre(
  payload: CreateGenreInput
): Promise<CreateGenreResult> {
  try {
    const supabase = await createClient();

    if (!payload?.name || !payload.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    const name = payload.name.trim();
    const slug = (payload.slug && payload.slug.trim())
      ? slugify(payload.slug.trim())
      : slugify(name);

    const description = payload.description?.trim() || null;

    // Check duplicate name (case-insensitive)
    let existingByName: any = null;
    try {
      const res = await supabase
        .from("genres")
        .select("id, name")
        .is("deleted_at", null)
        .ilike("name", name)
        .maybeSingle();

      if (res.error) {
        const msg = res.error.message || JSON.stringify(res.error || "");
        if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
          throw res.error;
        }
      }

      existingByName = res.data;
    } catch (err) {
      // Fallback: query without deleted_at filter
      const res2 = await supabase.from("genres").select("id, name").ilike("name", name).maybeSingle();
      if (res2.error) {
        console.error("Error checking existing genre name:", res2.error);
        return { success: false, error: "Failed to validate genre name" };
      }
      existingByName = res2.data;
    }

    if (existingByName) {
      return { success: false, error: `Genre name already exists: "${existingByName.name}"` };
    }

    // Check duplicate slug (exact match)
    let existingBySlug: any = null;
    try {
      const res = await supabase
        .from("genres")
        .select("id, slug")
        .is("deleted_at", null)
        .eq("slug", slug)
        .maybeSingle();

      if (res.error) {
        const msg = res.error.message || JSON.stringify(res.error || "");
        if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
          throw res.error;
        }
      }

      existingBySlug = res.data;
    } catch (err) {
      const res2 = await supabase.from("genres").select("id, slug").eq("slug", slug).maybeSingle();
      if (res2.error) {
        console.error("Error checking existing genre slug:", res2.error);
        return { success: false, error: "Failed to validate slug" };
      }
      existingBySlug = res2.data;
    }

    // Insert genre
    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("genres")
      .insert({ name, slug, description, updated_at: now })
      .limit(1);

    if (insertError) {
      console.error("Error inserting genre:", insertError);
      return { success: false, error: insertError.message || "Failed to create genre" };
    }

    // Revalidate admin genres list
    revalidatePath("/admin/genres");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in createGenre:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}

export interface UpdateGenreInput {
  name?: string;
  slug?: string;
  description?: string | null;
}

export async function updateGenre(
  genreId: string,
  payload: UpdateGenreInput
): Promise<CreateGenreResult> {
  try {
    const supabase = await createClient();

    if (!genreId || !genreId.trim()) {
      return { success: false, error: "Genre ID is required" };
    }

    // Fetch genre and ensure it exists and isn't soft-deleted
    let genre: any = null;
    const genreRes = await supabase
      .from("genres")
      .select("id, deleted_at")
      .eq("id", genreId)
      .maybeSingle();

    if (genreRes.error) {
      const msg = genreRes.error.message || JSON.stringify(genreRes.error || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase
          .from("genres")
          .select("id")
          .eq("id", genreId)
          .maybeSingle();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Genre not found" };
        }
        genre = { ...fallback.data, deleted_at: null };
      } else {
        return { success: false, error: genreRes.error.message || "Genre fetch error" };
      }
    } else {
      genre = genreRes.data;
    }

    if (!genre) {
      return { success: false, error: "Genre not found" };
    }

    if ((genre as any).deleted_at) {
      return { success: false, error: "Cannot update a deleted genre" };
    }

    // Prepare updates
    const updates: any = {};
    if (payload.name !== undefined && payload.name !== null) {
      const nameTrim = payload.name.trim();
      if (!nameTrim) return { success: false, error: "Name cannot be empty" };

      // Check duplicate name excluding self (case-insensitive)
      // Check duplicate name excluding self (case-insensitive), exclude deleted
      let dupByName: any = null;
      try {
        const res = await supabase
          .from("genres")
          .select("id, name")
          .is("deleted_at", null)
          .ilike("name", nameTrim)
          .neq("id", genreId)
          .maybeSingle();

        if (res.error) {
          const msg = res.error.message || JSON.stringify(res.error || "");
          if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
            throw res.error;
          }
        }

        dupByName = res.data;
      } catch (err) {
        const res2 = await supabase
          .from("genres")
          .select("id, name")
          .ilike("name", nameTrim)
          .neq("id", genreId)
          .maybeSingle();
        if (res2.error) {
          console.error("Error checking duplicate genre name:", res2.error);
          return { success: false, error: "Failed to validate genre name" };
        }
        dupByName = res2.data;
      }

      if (dupByName) {
        return { success: false, error: `Genre name already exists: "${dupByName.name}"` };
      }

      updates.name = nameTrim;
    }

    if (payload.slug !== undefined && payload.slug !== null) {
      const slugVal = slugify(payload.slug.trim());
      if (!slugVal) return { success: false, error: "Slug cannot be empty" };

      // Check duplicate slug excluding self
      // Check duplicate slug excluding self, exclude deleted
      let dupBySlug: any = null;
      try {
        const res = await supabase
          .from("genres")
          .select("id, slug")
          .is("deleted_at", null)
          .eq("slug", slugVal)
          .neq("id", genreId)
          .maybeSingle();

        if (res.error) {
          const msg = res.error.message || JSON.stringify(res.error || "");
          if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
            throw res.error;
          }
        }

        dupBySlug = res.data;
      } catch (err) {
        const res2 = await supabase
          .from("genres")
          .select("id, slug")
          .eq("slug", slugVal)
          .neq("id", genreId)
          .maybeSingle();
        if (res2.error) {
          console.error("Error checking duplicate slug:", res2.error);
          return { success: false, error: "Failed to validate slug" };
        }
        dupBySlug = res2.data;
      }

      if (dupBySlug) {
        return { success: false, error: `Slug already exists: "${dupBySlug.slug}"` };
      }

      updates.slug = slugVal;
    }

    if (payload.description !== undefined) {
      updates.description = payload.description === null ? null : payload.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return { success: true };
    }

    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("genres")
      .update(updates)
      .eq("id", genreId);

    if (updateError) {
      console.error("Error updating genre:", updateError);
      return { success: false, error: updateError.message || "Failed to update genre" };
    }

    revalidatePath("/admin/genres");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in updateGenre:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}

export async function softDeleteGenre(
  genreId: string
): Promise<CreateGenreResult> {
  try {
    const supabase = await createClient();

    if (!genreId || !genreId.trim()) {
      return { success: false, error: "Genre ID is required" };
    }

    // Fetch genre and ensure it exists and isn't already deleted
    let genre: any = null;
    const genreRes = await supabase
      .from("genres")
      .select("id, deleted_at")
      .eq("id", genreId)
      .maybeSingle();

    if (genreRes.error) {
      const msg = genreRes.error.message || JSON.stringify(genreRes.error || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase
          .from("genres")
          .select("id")
          .eq("id", genreId)
          .maybeSingle();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Genre not found" };
        }
        genre = { ...fallback.data, deleted_at: null };
      } else {
        return { success: false, error: genreRes.error.message || "Genre fetch error" };
      }
    } else {
      genre = genreRes.data;
    }

    if (!genre) {
      return { success: false, error: "Genre not found" };
    }

    if ((genre as any).deleted_at) {
      return { success: false, error: "Genre is already deleted" };
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("genres")
      .update({ deleted_at: now })
      .eq("id", genreId);

    if (updateError) {
      console.error("Error soft-deleting genre:", updateError);
      return { success: false, error: updateError.message || "Failed to delete genre" };
    }

    // Do NOT modify pivot records (novel_genres) or novels themselves per rules

    revalidatePath("/admin/genres");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in softDeleteGenre:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
