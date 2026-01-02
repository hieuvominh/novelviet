"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Input type for creating a new novel
 */
export interface CreateNovelInput {
  title: string;
  description?: string;
  author_id?: string | null;
  status?: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  is_published?: boolean;
  cover_url?: string;
  genre_ids?: string[];
}

/**
 * Return type for createNovel action
 */
export interface CreateNovelResult {
  success: boolean;
  data?: {
    id: string;
    slug: string;
  };
  error?: string;
}

/**
 * Server Action: Create a new novel
 * 
 * Features:
 * - Normalizes title using SQL normalize_text function
 * - Checks for duplicate novels by (normalized_title, author_id)
 * - Auto-generates slug via database trigger
 * - Returns novel id and slug
 * 
 * @param input - Novel creation data
 * @returns CreateNovelResult with success status, data, or error
 */
export async function createNovel(
  input: CreateNovelInput
): Promise<CreateNovelResult> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (!input.title?.trim()) {
      return {
        success: false,
        error: "Title is required",
      };
    }

    // description and author are optional for creation

    // If author_id provided, validate author exists
    if (input.author_id) {
      // Ensure author exists and is not soft-deleted when possible
      let authorExists = false;
      try {
        const res = await supabase
          .from("authors")
          .select("id")
          .is("deleted_at", null)
          .eq("id", input.author_id)
          .maybeSingle();

        if (res.error) {
          const msg = res.error.message || JSON.stringify(res.error || "");
          if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
            throw res.error;
          }
        }
        if (res.data) authorExists = true;
      } catch (err) {
        // Fallback: query without deleted_at filter
        const res2 = await supabase.from("authors").select("id").eq("id", input.author_id).maybeSingle();
        if (res2.error) {
          console.error("Error validating author:", res2.error);
          return { success: false, error: "Author validation failed" };
        }
        if (res2.data) authorExists = true;
      }

      if (!authorExists) {
        return { success: false, error: "Author not found" };
      }
    }

    // Normalize title using SQL function to check for duplicates (only when author provided)
    const { data: normalizedData, error: normalizeError } = await supabase.rpc(
      "normalize_text",
      { text_input: input.title }
    );

    if (normalizeError) {
      console.error("Error normalizing title:", normalizeError);
      return {
        success: false,
        error: "Failed to validate title",
      };
    }

    const normalizedTitle = normalizedData as string;

    // Check for duplicate novel by (normalized_title, author_id) only if author_id provided
    if (input.author_id) {
      const { data: existingNovel, error: duplicateError } = await supabase
        .from("novels")
        .select("id, title")
        .eq("normalized_title", normalizedTitle)
        .eq("author_id", input.author_id)
        .maybeSingle();

      if (duplicateError) {
        console.error("Error checking for duplicates:", duplicateError);
        return {
          success: false,
          error: "Failed to check for duplicate novels",
        };
      }

      if (existingNovel) {
        return {
          success: false,
          error: `A novel with this title already exists for this author: "${existingNovel.title}"`,
        };
      }
    }

    // Insert new novel
    // Database will auto-generate:
    // - slug (via trigger)
    // - normalized_title (via trigger)
    // - published_at (if is_published = true)
    // - meta_title and meta_description (via trigger)
    const insertPayload: any = {
      title: input.title.trim(),
      status: input.status || "draft",
      is_published: input.is_published || false,
      cover_url: input.cover_url?.trim() || null,
    };

    if (typeof input.description === "string") insertPayload.description = input.description.trim();
    if (input.author_id) insertPayload.author_id = input.author_id;

    const { data: newNovel, error: insertError } = await supabase
      .from("novels")
      .insert(insertPayload)
      .select("id, slug")
      .single();

    if (insertError) {
      console.error("Error inserting novel:", insertError);
      return {
        success: false,
        error: insertError.message || "Failed to create novel",
      };
    }

    if (!newNovel) {
      return {
        success: false,
        error: "Novel created but no data returned",
      };
    }

    // Insert novel_genres pivot records if provided
    if (input.genre_ids && Array.isArray(input.genre_ids) && input.genre_ids.length > 0) {
      const pivotInserts = input.genre_ids.map((gid) => ({ novel_id: newNovel.id, genre_id: gid }));
      const { error: pivotError } = await supabase.from("novel_genres").insert(pivotInserts);
      if (pivotError) {
        console.error("Error inserting novel_genres:", pivotError);
        // Not failing the whole request, but log and return success with warning
      }
    }

    // Revalidate relevant paths
    revalidatePath("/admin/novels");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: newNovel.id,
        slug: newNovel.slug,
      },
    };
  } catch (error) {
    console.error("Unexpected error in createNovel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Input type for toggling novel publish status
 */
export interface ToggleNovelPublishInput {
  novel_id: string;
  is_published: boolean;
}

/**
 * Return type for toggleNovelPublish action
 */
export interface ToggleNovelPublishResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Toggle publish status for a novel
 * 
 * Features:
 * - Sets is_published to true/false
 * - Sets published_at to NOW() when publishing
 * - Sets published_at to NULL when unpublishing
 * - Revalidates novel page and homepage
 * 
 * @param input - Toggle publish data
 * @returns ToggleNovelPublishResult with success status or error
 */
export async function toggleNovelPublish(
  input: ToggleNovelPublishInput
): Promise<ToggleNovelPublishResult> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (!input.novel_id?.trim()) {
      return {
        success: false,
        error: "Novel ID is required",
      };
    }

    // Get novel to verify it exists and get slug for revalidation
    let novel: any = null;
    const novelRes = await supabase
      .from("novels")
      .select("id, slug, deleted_at")
      .eq("id", input.novel_id)
      .single();

    if (novelRes.error) {
      const msg = novelRes.error.message || JSON.stringify(novelRes.error || "");
      // If the error mentions deleted_at (column missing), retry without selecting deleted_at
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase
          .from("novels")
          .select("id, slug")
          .eq("id", input.novel_id)
          .single();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Novel not found" };
        }
        novel = fallback.data;
        novel.deleted_at = null;
      } else {
        return { success: false, error: novelRes.error.message || "Novel fetch error" };
      }
    } else {
      novel = novelRes.data;
    }

    // Prevent publishing/unpublishing deleted novels
    if (novel.deleted_at) {
      return {
        success: false,
        error: "Cannot change publish status of a deleted novel",
      };
    }

    // Update publish status
    const updateData: any = {
      is_published: input.is_published,
    };

    // Set published_at based on publish status
    if (input.is_published) {
      // Publishing: set to current timestamp (will be handled by trigger if not set)
      // The trigger will set it, but we can be explicit
      updateData.published_at = new Date().toISOString();
    } else {
      // Unpublishing: set to null
      updateData.published_at = null;
    }

    const { error: updateError } = await supabase
      .from("novels")
      .update(updateData)
      .eq("id", input.novel_id);

    if (updateError) {
      console.error("Error updating novel publish status:", updateError);
      return {
        success: false,
        error: updateError.message || "Failed to update publish status",
      };
    }

    // Revalidate paths for ISR
    revalidatePath("/"); // Homepage
    revalidatePath(`/truyen/${novel.slug}`); // Novel page
    revalidatePath("/admin/novels"); // Admin novels list

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error in toggleNovelPublish:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}


/**
 * Input type for updating an existing novel
 */
export interface UpdateNovelInput {
  novel_id: string;
  title?: string;
  description?: string;
  author_id?: string;
  status?: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  is_published?: boolean;
  cover_url?: string | null;
  genre_ids?: string[];
}

export interface UpdateNovelResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Update an existing novel and its genres
 */
export async function updateNovel(
  input: UpdateNovelInput
): Promise<UpdateNovelResult> {
  try {
    const supabase = await createClient();

    if (!input.novel_id || !input.novel_id.trim()) {
      return { success: false, error: "Novel ID is required" };
    }

    // Update novel fields
    const updateData: any = {};
    if (typeof input.title === "string") updateData.title = input.title.trim();
    if (typeof input.description === "string") updateData.description = input.description.trim();
    if (typeof input.author_id === "string") updateData.author_id = input.author_id;
    if (typeof input.status === "string") updateData.status = input.status;
    if (typeof input.is_published === "boolean") updateData.is_published = input.is_published;
    if (typeof input.cover_url !== "undefined") updateData.cover_url = input.cover_url || null;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("novels")
        .update(updateData)
        .eq("id", input.novel_id);

      if (updateError) {
        console.error("Error updating novel:", updateError);
        return { success: false, error: updateError.message || "Failed to update novel" };
      }
    }

    // Sync genres: delete existing and insert new ones (if provided)
    if (Array.isArray(input.genre_ids)) {
      const { error: delError } = await supabase
        .from("novel_genres")
        .delete()
        .eq("novel_id", input.novel_id);

      if (delError) {
        console.error("Error deleting existing novel_genres:", delError);
        return { success: false, error: delError.message || "Failed to update genres" };
      }

      if (input.genre_ids.length > 0) {
        const pivotInserts = input.genre_ids.map((gid) => ({ novel_id: input.novel_id, genre_id: gid }));
        const { error: pivotError } = await supabase.from("novel_genres").insert(pivotInserts);
        if (pivotError) {
          console.error("Error inserting novel_genres:", pivotError);
          return { success: false, error: pivotError.message || "Failed to update genres" };
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath("/admin/novels");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateNovel:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

/**
 * Return type for softDeleteNovel action
 */
export interface SoftDeleteNovelResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Soft-delete a novel and its chapters
 *
 * - Sets novels.deleted_at = NOW()
 * - Sets novels.published_at = NULL
 * - Sets chapters.deleted_at = NOW() for all chapters of the novel
 * - Sets chapters.published_at = NULL for those chapters
 * - Does not hard-delete anything
 * - Revalidates admin and public paths
 */
export async function softDeleteNovel(
  novelId: string
): Promise<SoftDeleteNovelResult> {
  try {
    const supabase = await createClient();

    if (!novelId || !novelId.trim()) {
      return { success: false, error: "Novel ID is required" };
    }

    // Fetch novel and check deleted state (fall back if deleted_at column missing)
    let novel: any = null;
    const novelRes = await supabase
      .from("novels")
      .select("id, slug, deleted_at")
      .eq("id", novelId)
      .single();

    if (novelRes.error) {
      const msg = novelRes.error.message || JSON.stringify(novelRes.error || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase
          .from("novels")
          .select("id, slug")
          .eq("id", novelId)
          .single();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Novel not found" };
        }
        novel = { ...fallback.data, deleted_at: null };
      } else {
        return { success: false, error: novelRes.error.message || "Novel fetch error" };
      }
    } else {
      novel = novelRes.data;
    }

    if (!novel) {
      return { success: false, error: "Novel not found" };
    }

    if (novel.deleted_at) {
      return { success: false, error: "Novel is already deleted" };
    }

    const now = new Date().toISOString();

    // Soft-delete chapters: set deleted_at and clear published_at
    const { error: chaptersUpdateError } = await supabase
      .from("chapters")
      .update({ deleted_at: now, published_at: null })
      .eq("novel_id", novelId);

    if (chaptersUpdateError) {
      console.error("Error soft-deleting chapters:", chaptersUpdateError);
      return { success: false, error: chaptersUpdateError.message || "Failed to soft-delete chapters" };
    }

    // Soft-delete novel: set deleted_at and clear published_at
    const { error: novelUpdateError } = await supabase
      .from("novels")
      .update({ deleted_at: now, published_at: null })
      .eq("id", novelId);

    if (novelUpdateError) {
      console.error("Error soft-deleting novel:", novelUpdateError);
      return { success: false, error: novelUpdateError.message || "Failed to soft-delete novel" };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/novels");
    revalidatePath(`/admin/novels/${novelId}`);
    if (novel.slug) revalidatePath(`/truyen/${novel.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in softDeleteNovel:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
