// ============================================================================
// DATABASE TYPES FOR VIETNAMESE NOVEL PLATFORM
// ============================================================================
// Auto-generate these types using Supabase CLI:
// npx supabase gen types typescript --project-id "your-ref" > src/types/database.types.ts
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// ENUMS
// ============================================================================

export type NovelStatus = 'draft' | 'ongoing' | 'completed' | 'hiatus' | 'dropped';
export type ContentSource = 'crawled' | 'manual' | 'imported';

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          bio: string | null;
          avatar_url: string | null;
          normalized_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          bio?: string | null;
          avatar_url?: string | null;
          normalized_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          bio?: string | null;
          avatar_url?: string | null;
          normalized_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      genres: {
        Row: {
          id: string;
          name: string;
          slug: string;
          name_vi: string | null;
          description: string | null;
          parent_id: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          name_vi?: string | null;
          description?: string | null;
          parent_id?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          name_vi?: string | null;
          description?: string | null;
          parent_id?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      novels: {
        Row: {
          id: string;
          title: string;
          slug: string;
          alternative_titles: string[] | null;
          description: string;
          cover_url: string | null;
          author_id: string;
          status: NovelStatus;
          normalized_title: string;
          source_url: string | null;
          source_type: ContentSource;
          total_chapters: number;
          total_words: number;
          view_count_total: number;
          view_count_weekly: number;
          view_count_daily: number;
          rating_average: number;
          rating_count: number;
          bookmark_count: number;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string[] | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          last_chapter_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug?: string;
          alternative_titles?: string[] | null;
          description: string;
          cover_url?: string | null;
          author_id: string;
          status?: NovelStatus;
          normalized_title?: string;
          source_url?: string | null;
          source_type?: ContentSource;
          total_chapters?: number;
          total_words?: number;
          view_count_total?: number;
          view_count_weekly?: number;
          view_count_daily?: number;
          rating_average?: number;
          rating_count?: number;
          bookmark_count?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          last_chapter_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          alternative_titles?: string[] | null;
          description?: string;
          cover_url?: string | null;
          author_id?: string;
          status?: NovelStatus;
          normalized_title?: string;
          source_url?: string | null;
          source_type?: ContentSource;
          total_chapters?: number;
          total_words?: number;
          view_count_total?: number;
          view_count_weekly?: number;
          view_count_daily?: number;
          rating_average?: number;
          rating_count?: number;
          bookmark_count?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          last_chapter_at?: string | null;
        };
      };
      novel_genres: {
        Row: {
          novel_id: string;
          genre_id: string;
          created_at: string;
        };
        Insert: {
          novel_id: string;
          genre_id: string;
          created_at?: string;
        };
        Update: {
          novel_id?: string;
          genre_id?: string;
          created_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          novel_id: string;
          title: string;
          slug: string;
          chapter_number: number;
          content: string;
          word_count: number;
          normalized_title: string;
          source_url: string | null;
          content_hash: string | null;
          is_published: boolean;
          published_at: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          novel_id: string;
          title: string;
          slug?: string;
          chapter_number: number;
          content: string;
          word_count?: number;
          normalized_title?: string;
          source_url?: string | null;
          content_hash?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          novel_id?: string;
          title?: string;
          slug?: string;
          chapter_number?: number;
          content?: string;
          word_count?: number;
          normalized_title?: string;
          source_url?: string | null;
          content_hash?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapter_views: {
        Row: {
          id: number;
          chapter_id: string;
          novel_id: string;
          user_id: string | null;
          viewed_at: string;
          session_id: string | null;
          ip_hash: string | null;
          view_date: string;
        };
        Insert: {
          id?: number;
          chapter_id: string;
          novel_id: string;
          user_id?: string | null;
          viewed_at?: string;
          session_id?: string | null;
          ip_hash?: string | null;
          view_date?: string;
        };
        Update: {
          id?: number;
          chapter_id?: string;
          novel_id?: string;
          user_id?: string | null;
          viewed_at?: string;
          session_id?: string | null;
          ip_hash?: string | null;
          view_date?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          novel_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          novel_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          novel_id?: string;
          created_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          novel_id: string;
          chapter_id: string;
          progress_percentage: number;
          scroll_position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          novel_id: string;
          chapter_id: string;
          progress_percentage?: number;
          scroll_position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          novel_id?: string;
          chapter_id?: string;
          progress_percentage?: number;
          scroll_position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          novel_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          novel_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          novel_id?: string;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      novel_statistics: {
        Row: {
          novel_id: string;
          title: string;
          slug: string;
          author_id: string;
          status: NovelStatus;
          chapter_count: number;
          total_words: number;
          view_count_total: number;
          view_count_weekly: number;
          view_count_daily: number;
          rating_average: number;
          rating_count: number;
          bookmark_count: number;
          last_chapter_published_at: string | null;
        };
      };
    };
    Functions: {
      slugify: {
        Args: { text_input: string };
        Returns: string;
      };
      normalize_text: {
        Args: { text_input: string };
        Returns: string;
      };
      generate_unique_slug: {
        Args: {
          base_text: string;
          table_name: string;
          existing_id?: string;
        };
        Returns: string;
      };
      compute_content_hash: {
        Args: { content: string };
        Returns: string;
      };
      record_chapter_view: {
        Args: {
          p_chapter_id: string;
          p_novel_id: string;
          p_user_id?: string;
          p_session_id?: string;
          p_ip_hash?: string;
        };
        Returns: boolean;
      };
      aggregate_chapter_views: {
        Args: Record<string, never>;
        Returns: void;
      };
      reset_daily_view_counts: {
        Args: Record<string, never>;
        Returns: void;
      };
      reset_weekly_view_counts: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_old_chapter_views: {
        Args: Record<string, never>;
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_novel_statistics: {
        Args: { limit_count?: number };
        Returns: Array<{
          novel_id: string;
          title: string;
          slug: string;
          author_id: string;
          status: NovelStatus;
          chapter_count: number;
          total_words: number;
          view_count_total: number;
          view_count_weekly: number;
          view_count_daily: number;
          rating_average: number;
          rating_count: number;
          bookmark_count: number;
          last_chapter_published_at: string | null;
        }>;
      };
    };
    Enums: {
      novel_status: NovelStatus;
      content_source: ContentSource;
    };
  };
}
