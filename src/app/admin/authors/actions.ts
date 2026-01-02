"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateAuthorInput {
  name: string;
  slug?: string;
  bio?: string;
}

export interface CreateAuthorResult {
  success: boolean;
  error?: string;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createAuthor(
  payload: CreateAuthorInput
): Promise<CreateAuthorResult> {
  try {
    const supabase = await createClient();

    if (!payload?.name || !payload.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    const name = payload.name.trim();
    const slug = payload.slug && payload.slug.trim() ? slugify(payload.slug.trim()) : slugify(name);
    const bio = payload.bio?.trim() || null;

    // Check duplicate name (case-insensitive)
    let existingByName: any = null;
    try {
      const res = await supabase
        .from("authors")
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
      // Fallback without deleted_at filter
      const res2 = await supabase.from("authors").select("id, name").ilike("name", name).maybeSingle();
      if (res2.error) {
        console.error("Error checking existing author name:", res2.error);
        return { success: false, error: "Failed to validate author name" };
      }
      existingByName = res2.data;
    }

    if (existingByName) {
      return { success: false, error: `Author name already exists: "${existingByName.name}"` };
    }

    // Check duplicate slug
    let existingBySlug: any = null;
    try {
      const res = await supabase
        .from("authors")
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
      const res2 = await supabase.from("authors").select("id, slug").eq("slug", slug).maybeSingle();
      if (res2.error) {
        console.error("Error checking existing author slug:", res2.error);
        return { success: false, error: "Failed to validate slug" };
      }
      existingBySlug = res2.data;
    }

    if (existingBySlug) {
      return { success: false, error: `Slug already exists: "${existingBySlug.slug}"` };
    }

    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("authors")
      .insert({ name, slug, bio, updated_at: now })
      .limit(1);

    if (insertError) {
      console.error("Error inserting author:", insertError);
      return { success: false, error: insertError.message || "Failed to create author" };
    }

    revalidatePath("/admin/authors");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in createAuthor:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}

export interface UpdateAuthorInput {
  name?: string | null;
  slug?: string | null;
  bio?: string | null;
}

export async function updateAuthor(
  authorId: string,
  payload: UpdateAuthorInput
): Promise<CreateAuthorResult> {
  try {
    if (!authorId) return { success: false, error: "Author ID is required" };

    const supabase = await createClient();

    // Fetch existing author and ensure it exists and is not soft-deleted
    let existing: any = null;
    try {
      const res = await supabase
        .from("authors")
        .select("id, name, slug, bio, deleted_at")
        .is("deleted_at", null)
        .eq("id", authorId)
        .maybeSingle();

      if (res.error) {
        const msg = res.error.message || JSON.stringify(res.error || "");
        if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
          throw res.error;
        }
      }

      existing = res.data;
    } catch (err) {
      // Fallback: query without deleted_at filter
      const res2 = await supabase
        .from("authors")
        .select("id, name, slug, bio, deleted_at")
        .eq("id", authorId)
        .maybeSingle();

      if (res2.error) {
        console.error("Error fetching author:", res2.error);
        return { success: false, error: "Failed to fetch author" };
      }
      existing = res2.data;
    }

    if (!existing) return { success: false, error: "Author not found or has been deleted" };

    if (existing.deleted_at) {
      return { success: false, error: "Author has been deleted" };
    }

    // Prepare updates only for provided fields
    const updates: any = {};

    // Name handling
    if (payload.name !== undefined && payload.name !== null) {
      const nameTrim = payload.name?.trim() || "";
      if (!nameTrim) return { success: false, error: "Name cannot be empty" };
      updates.name = nameTrim;
    }

    // Slug handling: if provided, normalize it; if provided as empty string -> error
    if (payload.slug !== undefined) {
      if (payload.slug === null) {
        updates.slug = null;
      } else {
        const slugVal = payload.slug?.trim() || "";
        if (!slugVal) return { success: false, error: "Slug cannot be empty" };
        updates.slug = slugify(slugVal);
      }
    }

    // Bio handling: allow null (clear) or string
    if (payload.bio !== undefined) {
      if (payload.bio === null) updates.bio = null;
      else updates.bio = payload.bio.trim() || null;
    }

    // If no updatable fields provided, nothing to do
    if (Object.keys(updates).length === 0) {
      return { success: true };
    }

    // Duplicate checks (exclude self)
    if (updates.name) {
      // Check duplicate name
      try {
        const dup = await supabase
          .from("authors")
          .select("id, name")
          .is("deleted_at", null)
          .ilike("name", updates.name)
          .neq("id", authorId)
          .maybeSingle();

        if (dup.error) {
          const msg = dup.error.message || JSON.stringify(dup.error || "");
          if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
            throw dup.error;
          }
        }

        if (dup.data) return { success: false, error: `Author name already exists: "${dup.data.name}"` };
      } catch (err) {
        // Fallback without deleted_at filter
        const dup2 = await supabase
          .from("authors")
          .select("id, name")
          .ilike("name", updates.name)
          .neq("id", authorId)
          .maybeSingle();

        if (dup2.error) {
          console.error("Error checking duplicate author name:", dup2.error);
          return { success: false, error: "Failed to validate author name" };
        }
        if (dup2.data) return { success: false, error: `Author name already exists: "${dup2.data.name}"` };
      }
    }

    if (updates.slug) {
      try {
        const dup = await supabase
          .from("authors")
          .select("id, slug")
          .is("deleted_at", null)
          .eq("slug", updates.slug)
          .neq("id", authorId)
          .maybeSingle();

        if (dup.error) {
          const msg = dup.error.message || JSON.stringify(dup.error || "");
          if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
            throw dup.error;
          }
        }

        if (dup.data) return { success: false, error: `Slug already exists: "${dup.data.slug}"` };
      } catch (err) {
        const dup2 = await supabase
          .from("authors")
          .select("id, slug")
          .eq("slug", updates.slug)
          .neq("id", authorId)
          .maybeSingle();

        if (dup2.error) {
          console.error("Error checking duplicate slug:", dup2.error);
          return { success: false, error: "Failed to validate slug" };
        }
        if (dup2.data) return { success: false, error: `Slug already exists: "${dup2.data.slug}"` };
      }
    }

    // Set updated_at
    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase.from("authors").update(updates).eq("id", authorId).limit(1);

    if (updateError) {
      console.error("Error updating author:", updateError);
      return { success: false, error: updateError.message || "Failed to update author" };
    }

    // Revalidate admin list
    revalidatePath("/admin/authors");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in updateAuthor:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}

export async function softDeleteAuthor(authorId: string): Promise<CreateAuthorResult> {
  try {
    if (!authorId) return { success: false, error: "Author ID is required" };

    const supabase = await createClient();

    // Fetch author, prefer checking deleted_at=null but fallback if the column doesn't exist
    let existing: any = null;
    try {
      const res = await supabase
        .from("authors")
        .select("id, deleted_at")
        .is("deleted_at", null)
        .eq("id", authorId)
        .maybeSingle();

      if (res.error) {
        const msg = res.error.message || JSON.stringify(res.error || "");
        if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
          throw res.error;
        }
      }

      existing = res.data;
    } catch (err) {
      // Fallback without deleted_at filter
      const res2 = await supabase.from("authors").select("id, deleted_at").eq("id", authorId).maybeSingle();
      if (res2.error) {
        console.error("Error fetching author for delete:", res2.error);
        return { success: false, error: "Failed to fetch author" };
      }
      existing = res2.data;
    }

    if (!existing) return { success: false, error: "Author not found or already deleted" };

    // If the deleted_at column exists and is already set, prevent double delete
    if (existing.deleted_at) {
      return { success: false, error: "Author already deleted" };
    }

    // If the authors table doesn't have deleted_at (undefined), inform user to run migrations
    if (!Object.prototype.hasOwnProperty.call(existing, "deleted_at")) {
      return { success: false, error: "Database schema missing 'deleted_at' on authors — run migrations" };
    }

    const now = new Date().toISOString();
    const { error: updErr } = await supabase
      .from("authors")
      .update({ deleted_at: now })
      .eq("id", authorId)
      .limit(1);

    if (updErr) {
      console.error("Error soft-deleting author:", updErr);
      return { success: false, error: updErr.message || "Failed to delete author" };
    }

    revalidatePath("/admin/authors");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in softDeleteAuthor:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
