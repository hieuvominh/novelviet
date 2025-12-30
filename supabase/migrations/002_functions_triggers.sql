-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================
-- Automation for slugs, timestamps, aggregations, and anti-duplicate logic
-- ============================================================================

-- ============================================================================
-- FUNCTION: update_updated_at_column
-- ============================================================================
-- Generic trigger function to update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genres_updated_at BEFORE UPDATE ON genres
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_novels_updated_at BEFORE UPDATE ON novels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: slugify
-- ============================================================================
-- Generate URL-safe slug from Vietnamese text
-- Handles Vietnamese characters, removes accents, converts to lowercase
-- ============================================================================

CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    result := LOWER(TRIM(text_input));
    
    -- Replace Vietnamese characters
    result := TRANSLATE(result,
        'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd'
    );
    
    -- Replace spaces and special chars with hyphens
    result := REGEXP_REPLACE(result, '[^a-z0-9]+', '-', 'g');
    
    -- Remove leading/trailing hyphens
    result := REGEXP_REPLACE(result, '^-+|-+$', '', 'g');
    
    -- Replace multiple hyphens with single
    result := REGEXP_REPLACE(result, '-+', '-', 'g');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FUNCTION: normalize_text
-- ============================================================================
-- Normalize text for duplicate detection
-- Removes accents, lowercase, removes extra spaces
-- ============================================================================

CREATE OR REPLACE FUNCTION normalize_text(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    result := LOWER(TRIM(text_input));
    
    -- Replace Vietnamese characters
    result := TRANSLATE(result,
        'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd'
    );
    
    -- Remove special characters
    result := REGEXP_REPLACE(result, '[^a-z0-9\s]', '', 'g');
    
    -- Replace multiple spaces with single space
    result := REGEXP_REPLACE(result, '\s+', ' ', 'g');
    
    RETURN TRIM(result);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FUNCTION: generate_unique_slug
-- ============================================================================
-- Generate unique slug with collision handling
-- Appends numeric suffix if slug already exists
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_unique_slug(
    base_text TEXT,
    table_name TEXT,
    existing_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    exists_check BOOLEAN;
BEGIN
    base_slug := slugify(base_text);
    final_slug := base_slug;
    
    -- Check for collisions
    LOOP
        EXECUTE format(
            'SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))',
            table_name
        ) INTO exists_check USING final_slug, existing_id;
        
        EXIT WHEN NOT exists_check;
        
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: compute_content_hash
-- ============================================================================
-- Generate SHA256 hash of normalized content for duplicate detection
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_content_hash(content TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(normalize_text(content), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGER: auto_generate_author_slug
-- ============================================================================
-- Automatically generate slug and normalized name for authors
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_author_slug_and_normalized()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.name, 'authors', NEW.id);
    END IF;
    
    NEW.normalized_name := normalize_text(NEW.name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_author_slug
    BEFORE INSERT OR UPDATE ON authors
    FOR EACH ROW
    EXECUTE FUNCTION generate_author_slug_and_normalized();

-- ============================================================================
-- TRIGGER: auto_generate_genre_slug
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_genre_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.name, 'genres', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_genre_slug
    BEFORE INSERT OR UPDATE ON genres
    FOR EACH ROW
    EXECUTE FUNCTION generate_genre_slug();

-- ============================================================================
-- TRIGGER: auto_generate_novel_slug_and_normalized
-- ============================================================================
-- Generate slug, normalized title, and set published_at
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_novel_slug_and_normalized()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.title, 'novels', NEW.id);
    END IF;
    
    -- Generate normalized title for duplicate detection
    NEW.normalized_title := normalize_text(NEW.title);
    
    -- Set published_at when first published
    IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN
        NEW.published_at := NOW();
    END IF;
    
    -- Auto-generate meta fields if empty
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := LEFT(NEW.title, 60);
    END IF;
    
    IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
        NEW.meta_description := LEFT(NEW.description, 160);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_novel_slug
    BEFORE INSERT OR UPDATE ON novels
    FOR EACH ROW
    EXECUTE FUNCTION generate_novel_slug_and_normalized();

-- ============================================================================
-- TRIGGER: auto_generate_chapter_slug_and_hash
-- ============================================================================
-- Generate slug, normalized title, content hash, word count
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_chapter_slug_and_hash()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug if not provided (based on chapter number + title)
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := 'chuong-' || NEW.chapter_number || '-' || slugify(LEFT(NEW.title, 50));
        
        -- Ensure uniqueness within novel
        DECLARE
            counter INTEGER := 1;
            temp_slug TEXT := NEW.slug;
        BEGIN
            WHILE EXISTS(
                SELECT 1 FROM chapters 
                WHERE novel_id = NEW.novel_id 
                AND slug = temp_slug 
                AND (NEW.id IS NULL OR id != NEW.id)
            ) LOOP
                counter := counter + 1;
                temp_slug := NEW.slug || '-' || counter;
            END LOOP;
            NEW.slug := temp_slug;
        END;
    END IF;
    
    -- Generate normalized title
    NEW.normalized_title := normalize_text(NEW.title);
    
    -- Generate content hash for duplicate detection
    NEW.content_hash := compute_content_hash(NEW.content);
    
    -- Calculate word count (approximate for Vietnamese)
    NEW.word_count := array_length(regexp_split_to_array(TRIM(NEW.content), '\s+'), 1);
    
    -- Set published_at when first published
    IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN
        NEW.published_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_chapter_slug
    BEFORE INSERT OR UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION generate_chapter_slug_and_hash();

-- ============================================================================
-- TRIGGER: update_novel_stats_on_chapter_change
-- ============================================================================
-- Update novel's total_chapters, total_words, last_chapter_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_novel_stats_on_chapter()
RETURNS TRIGGER AS $$
BEGIN
    -- Update on INSERT or UPDATE of published chapter
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_published = true THEN
        UPDATE novels SET
            total_chapters = (
                SELECT COUNT(*) FROM chapters 
                WHERE novel_id = NEW.novel_id AND is_published = true
            ),
            total_words = (
                SELECT COALESCE(SUM(word_count), 0) FROM chapters 
                WHERE novel_id = NEW.novel_id AND is_published = true
            ),
            last_chapter_at = (
                SELECT MAX(published_at) FROM chapters 
                WHERE novel_id = NEW.novel_id AND is_published = true
            )
        WHERE id = NEW.novel_id;
    END IF;
    
    -- Update on DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE novels SET
            total_chapters = (
                SELECT COUNT(*) FROM chapters 
                WHERE novel_id = OLD.novel_id AND is_published = true
            ),
            total_words = (
                SELECT COALESCE(SUM(word_count), 0) FROM chapters 
                WHERE novel_id = OLD.novel_id AND is_published = true
            ),
            last_chapter_at = (
                SELECT MAX(published_at) FROM chapters 
                WHERE novel_id = OLD.novel_id AND is_published = true
            )
        WHERE id = OLD.novel_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_novel_stats
    AFTER INSERT OR UPDATE OR DELETE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_novel_stats_on_chapter();

-- ============================================================================
-- TRIGGER: update_rating_aggregate
-- ============================================================================
-- Update novel's rating_average and rating_count on rating changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_rating_aggregate()
RETURNS TRIGGER AS $$
DECLARE
    target_novel_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_novel_id := OLD.novel_id;
    ELSE
        target_novel_id := NEW.novel_id;
    END IF;
    
    UPDATE novels SET
        rating_average = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM ratings
            WHERE novel_id = target_novel_id
        ), 0),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE novel_id = target_novel_id
        )
    WHERE id = target_novel_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating_aggregate
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_rating_aggregate();

-- ============================================================================
-- TRIGGER: update_bookmark_count
-- ============================================================================
-- Update novel's bookmark_count on bookmark changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
DECLARE
    target_novel_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_novel_id := OLD.novel_id;
    ELSE
        target_novel_id := NEW.novel_id;
    END IF;
    
    UPDATE novels SET
        bookmark_count = (
            SELECT COUNT(*)
            FROM bookmarks
            WHERE novel_id = target_novel_id
        )
    WHERE id = target_novel_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookmark_count
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmark_count();

-- ============================================================================
-- FUNCTION: record_chapter_view
-- ============================================================================
-- Safely record a chapter view (handles deduplication)
-- Returns true if view was recorded, false if duplicate
-- ============================================================================

CREATE OR REPLACE FUNCTION record_chapter_view(
    p_chapter_id UUID,
    p_novel_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    view_recorded BOOLEAN := false;
BEGIN
    -- Try to insert view (will fail silently if duplicate within hour)
    BEGIN
        INSERT INTO chapter_views (chapter_id, novel_id, user_id, session_id, ip_hash)
        VALUES (p_chapter_id, p_novel_id, p_user_id, p_session_id, p_ip_hash);
        
        view_recorded := true;
    EXCEPTION WHEN unique_violation THEN
        -- Duplicate view within same hour and session - ignore
        view_recorded := false;
    END;
    
    RETURN view_recorded;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: aggregate_chapter_views
-- ============================================================================
-- Aggregate views from chapter_views to chapters and novels
-- Should be called periodically (e.g., every 5-15 minutes via cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_chapter_views()
RETURNS void AS $$
BEGIN
    -- Update chapter view counts
    UPDATE chapters c SET
        view_count = view_count + subquery.new_views
    FROM (
        SELECT chapter_id, COUNT(*) as new_views
        FROM chapter_views
        WHERE viewed_at >= NOW() - INTERVAL '15 minutes'
        GROUP BY chapter_id
    ) AS subquery
    WHERE c.id = subquery.chapter_id;
    
    -- Update novel view counts (daily)
    UPDATE novels n SET
        view_count_daily = view_count_daily + subquery.new_views
    FROM (
        SELECT novel_id, COUNT(*) as new_views
        FROM chapter_views
        WHERE viewed_at >= NOW() - INTERVAL '15 minutes'
        GROUP BY novel_id
    ) AS subquery
    WHERE n.id = subquery.novel_id;
    
    -- Update novel view counts (weekly)
    UPDATE novels n SET
        view_count_weekly = view_count_weekly + subquery.new_views
    FROM (
        SELECT novel_id, COUNT(*) as new_views
        FROM chapter_views
        WHERE viewed_at >= NOW() - INTERVAL '15 minutes'
        GROUP BY novel_id
    ) AS subquery
    WHERE n.id = subquery.novel_id;
    
    -- Update novel view counts (total)
    UPDATE novels n SET
        view_count_total = view_count_total + subquery.new_views
    FROM (
        SELECT novel_id, COUNT(*) as new_views
        FROM chapter_views
        WHERE viewed_at >= NOW() - INTERVAL '15 minutes'
        GROUP BY novel_id
    ) AS subquery
    WHERE n.id = subquery.novel_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: reset_periodic_view_counts
-- ============================================================================
-- Reset daily/weekly view counts
-- Call via scheduled job (daily at midnight, weekly on Monday)
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_daily_view_counts()
RETURNS void AS $$
BEGIN
    UPDATE novels SET view_count_daily = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_weekly_view_counts()
RETURNS void AS $$
BEGIN
    UPDATE novels SET view_count_weekly = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: cleanup_old_chapter_views
-- ============================================================================
-- Delete chapter_views older than 30 days to save space
-- Call via scheduled job (daily or weekly)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_chapter_views()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chapter_views
    WHERE viewed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
