"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Input type for creating a new chapter
 */
export interface CreateChapterInput {
  novel_id: string;
  title: string;
  content: string; // Plain text, not markdown
  chapter_number?: number; // Optional - auto-increment if not provided
  is_published?: boolean;
}

/**
 * Return type for createChapter action
 */
export interface CreateChapterResult {
  success: boolean;
  data?: {
    id: string;
    chapter_number: number;
  };
  error?: string;
}

/**
 * Input type for updating a chapter
 */
export interface UpdateChapterInput {
  id: string;
  title: string;
  content: string; // Plain text, not markdown
  is_published?: boolean;
}

/**
 * Return type for updateChapter action
 */
export interface UpdateChapterResult {
  success: boolean;
  data?: {
    id: string;
  };
  error?: string;
}

/**
 * Input type for toggling chapter publish status
 */
export interface TogglePublishChapterInput {
  chapter_id: string;
  is_published: boolean;
}

/**
 * Return type for togglePublishChapter action
 */
export interface TogglePublishChapterResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Create a new chapter for a novel
 * 
 * Features:
 * - Auto-increments chapter_number if not provided
 * - Normalizes title using SQL normalize_text function
 * - Generates content_hash using SQL function
 * - Prevents duplicate chapters by (novel_id, chapter_number) or content_hash
 * - Auto-generates slug via database trigger
 * - Calculates word_count automatically via trigger
 * - Updates novel.last_chapter_at via trigger
 * 
 * @param input - Chapter creation data
 * @returns CreateChapterResult with success status, data, or error
 */
export async function createChapter(
  input: CreateChapterInput
): Promise<CreateChapterResult> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (!input.novel_id?.trim()) {
      return {
        success: false,
        error: "Novel ID is required",
      };
    }

    if (!input.title?.trim()) {
      return {
        success: false,
        error: "Title is required",
      };
    }

    if (!input.content?.trim()) {
      return {
        success: false,
        error: "Content is required",
      };
    }

    // Validate novel exists and is not deleted (explicit deleted_at filter)
    let novel: any = null;
    try {
      const res = await supabase
        .from("novels")
        .select("id, deleted_at")
        .eq("id", input.novel_id)
        .is("deleted_at", null)
        .single();

      if (res.error) {
        const msg = res.error.message || JSON.stringify(res.error || "");
        if (!msg.includes("deleted_at") && !msg.includes("does not exist")) {
          return { success: false, error: "Novel not found" };
        }
      }

      novel = res.data;
    } catch (err) {
      // Fallback if deleted_at column missing
      const fb = await supabase
        .from("novels")
        .select("id, deleted_at")
        .eq("id", input.novel_id)
        .single();
      if (fb.error || !fb.data) {
        return { success: false, error: "Novel not found" };
      }
      novel = fb.data;
    }

    if (!novel) {
      return { success: false, error: "Novel not found" };
    }

    if ((novel as any).deleted_at) {
      return {
        success: false,
        error: "Cannot create chapters for a deleted novel",
      };
    }

    // Determine chapter_number
    let chapterNumber = input.chapter_number;
    
    if (!chapterNumber || chapterNumber <= 0) {
      // Auto-increment from latest chapter
      const { data: latestChapter, error: latestError } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("novel_id", input.novel_id)
        .is("deleted_at", null)
        .order("chapter_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        console.error("Error fetching latest chapter:", latestError);
        return {
          success: false,
          error: "Failed to determine chapter number",
        };
      }

      chapterNumber = latestChapter ? latestChapter.chapter_number + 1 : 1;
    }

    // Check for duplicate by (novel_id, chapter_number)
    const { data: existingChapter, error: duplicateError } = await supabase
      .from("chapters")
      .select("id, title, chapter_number")
      .eq("novel_id", input.novel_id)
      .eq("chapter_number", chapterNumber)
      .is("deleted_at", null)
      .maybeSingle();

    if (duplicateError) {
      console.error("Error checking for duplicate chapter:", duplicateError);
      return {
        success: false,
        error: "Failed to check for duplicate chapters",
      };
    }

    if (existingChapter) {
      return {
        success: false,
        error: `Chapter ${chapterNumber} already exists: "${existingChapter.title}"`,
      };
    }

    // Generate content_hash to check for duplicate content
    const { data: contentHash, error: hashError } = await supabase.rpc(
      "compute_content_hash",
      { content: input.content }
    );

    if (hashError) {
      console.error("Error computing content hash:", hashError);
      return {
        success: false,
        error: "Failed to validate content",
      };
    }

    // Check for duplicate content
    const { data: duplicateContent, error: contentDuplicateError } = await supabase
      .from("chapters")
      .select("id, title, chapter_number")
      .eq("novel_id", input.novel_id)
      .eq("content_hash", contentHash)
      .is("deleted_at", null)
      .maybeSingle();

    if (contentDuplicateError) {
      console.error("Error checking for duplicate content:", contentDuplicateError);
      return {
        success: false,
        error: "Failed to check for duplicate content",
      };
    }

    if (duplicateContent) {
      return {
        success: false,
        error: `This content is identical to Chapter ${duplicateContent.chapter_number}: "${duplicateContent.title}"`,
      };
    }

    // Insert new chapter
    // Database will auto-generate:
    // - slug (via trigger)
    // - normalized_title (via trigger)
    // - content_hash (via trigger, though we already computed it)
    // - word_count (via trigger)
    // - published_at (if is_published = true)
    // - Update novel.last_chapter_at (via trigger)
    const { data: newChapter, error: insertError } = await supabase
      .from("chapters")
      .insert({
        novel_id: input.novel_id,
        title: input.title.trim(),
        content: input.content.trim(),
        chapter_number: chapterNumber,
        is_published: input.is_published || false,
      })
      .select("id, chapter_number")
      .single();

    if (insertError) {
      console.error("Error inserting chapter:", insertError);
      return {
        success: false,
        error: insertError.message || "Failed to create chapter",
      };
    }

    if (!newChapter) {
      return {
        success: false,
        error: "Chapter created but no data returned",
      };
    }

    // Revalidate relevant paths
    revalidatePath(`/admin/novels/${input.novel_id}/chapters`);
    revalidatePath("/admin/novels");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: newChapter.id,
        chapter_number: newChapter.chapter_number,
      },
    };
  } catch (error) {
    console.error("Unexpected error in createChapter:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server Action: Toggle publish status for a chapter
 * 
 * Features:
 * - Sets published_at to NOW() when publishing
 * - Sets published_at to NULL when unpublishing
 * - Revalidates novel and chapter pages
 * 
 * @param input - Chapter ID and new publish status
 * @returns TogglePublishChapterResult with success status or error
 */
export async function togglePublishChapter(
  input: TogglePublishChapterInput
): Promise<TogglePublishChapterResult> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (!input.chapter_id?.trim()) {
      return {
        success: false,
        error: "Chapter ID is required",
      };
    }

    // Fetch chapter to get novel_id and slug for revalidation and check deleted state
    let chapter: any = null;
    const chapterRes = await supabase
      .from("chapters")
      .select("id, novel_id, chapter_number, slug, deleted_at, novels(deleted_at, slug)")
      .eq("id", input.chapter_id)
      .single();

    if (chapterRes.error) {
      const msg = chapterRes.error.message || JSON.stringify(chapterRes.error || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        // Fallback to select without deleted_at
        const fallback = await supabase
          .from("chapters")
          .select("id, novel_id, chapter_number, slug, novels(slug)")
          .eq("id", input.chapter_id)
          .single();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Chapter not found" };
        }
        chapter = fallback.data;
        chapter.deleted_at = null;
        chapter.novels = chapter.novels || { slug: null };
      } else {
        return { success: false, error: chapterRes.error.message || "Chapter fetch error" };
      }
    } else {
      chapter = chapterRes.data;
    }

    // Prevent publishing/unpublishing deleted chapters or chapters whose novel is deleted
    if ((chapter as any).deleted_at) {
      return {
        success: false,
        error: "Cannot change publish status of a deleted chapter",
      };
    }

    const novelDeletedAt = (chapter as any).novels?.deleted_at;
    if (novelDeletedAt) {
      return {
        success: false,
        error: "Cannot change publish status because the parent novel is deleted",
      };
    }

    // Update chapter publish status
    const updateData: any = {
      is_published: input.is_published,
    };

    // Set published_at based on new status
    if (input.is_published) {
      updateData.published_at = new Date().toISOString();
    } else {
      updateData.published_at = null;
    }

    const { error: updateError } = await supabase
      .from("chapters")
      .update(updateData)
      .eq("id", input.chapter_id);

    if (updateError) {
      console.error("Error updating chapter:", updateError);
      return {
        success: false,
        error: updateError.message || "Failed to update chapter",
      };
    }

    // Revalidate relevant paths
    const novelSlug = (chapter.novels as any)?.slug;
    if (novelSlug) {
      revalidatePath(`/truyen/${novelSlug}`);
      revalidatePath(`/truyen/${novelSlug}/chuong-${chapter.chapter_number}`);
    }
    revalidatePath(`/admin/novels/${chapter.novel_id}/chapters`);
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error in togglePublishChapter:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server Action: Soft-delete a chapter
 *
 * - Sets chapters.deleted_at = NOW()
 * - Sets chapters.published_at = NULL
 * - Does not modify chapter_number
 * - Returns success/error for UI handling
 */
export async function softDeleteChapter(
  chapterId: string
): Promise<TogglePublishChapterResult> {
  try {
    const supabase = await createClient();

    if (!chapterId || !chapterId.trim()) {
      return { success: false, error: "Chapter ID is required" };
    }

    // Fetch chapter and parent novel slug, with fallback if deleted_at column missing
    let chapter: any = null;
    const chapterRes = await supabase
      .from("chapters")
      .select("id, novel_id, chapter_number, slug, deleted_at, novels(slug)")
      .eq("id", chapterId)
      .single();

    if (chapterRes.error) {
      const msg = chapterRes.error.message || JSON.stringify(chapterRes.error || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        const fallback = await supabase
          .from("chapters")
          .select("id, novel_id, chapter_number, slug, novels(slug)")
          .eq("id", chapterId)
          .single();
        if (fallback.error || !fallback.data) {
          return { success: false, error: "Chapter not found" };
        }
        chapter = { ...fallback.data, deleted_at: null };
      } else {
        return { success: false, error: chapterRes.error.message || "Chapter fetch error" };
      }
    } else {
      chapter = chapterRes.data;
    }

    if (!chapter) return { success: false, error: "Chapter not found" };

    if (chapter.deleted_at) {
      return { success: false, error: "Chapter is already deleted" };
    }

    const now = new Date().toISOString();

    // Attempt to set deleted_at and clear published_at. If deleted_at column doesn't exist, retry without it.
    let updateError: any = null;
    try {
      const up = await supabase
        .from("chapters")
        .update({ deleted_at: now, published_at: null })
        .eq("id", chapterId);
      updateError = up.error;
      if (updateError) throw updateError;
    } catch (err) {
      const msg = err?.message || JSON.stringify(err || "");
      if (msg.includes("deleted_at") || msg.includes("does not exist")) {
        // Retry updating only published_at
        const up2 = await supabase
          .from("chapters")
          .update({ published_at: null })
          .eq("id", chapterId);
        if (up2.error) {
          console.error("Error soft-deleting chapter (fallback):", up2.error);
          return { success: false, error: up2.error.message || "Failed to soft-delete chapter" };
        }
      } else {
        console.error("Error soft-deleting chapter:", err);
        return { success: false, error: err?.message || "Failed to soft-delete chapter" };
      }
    }

    // Revalidate paths
    revalidatePath(`/admin/novels/${chapter.novel_id}/chapters`);
    if ((chapter.novels as any)?.slug) {
      revalidatePath(`/truyen/${(chapter.novels as any).slug}`);
      revalidatePath(`/truyen/${(chapter.novels as any).slug}/chuong-${chapter.chapter_number}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in softDeleteChapter:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
