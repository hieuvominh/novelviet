-- ============================================================================
-- SCHEDULED JOBS SETUP (Using pg_cron)
-- ============================================================================
-- Configure periodic tasks for view aggregation and cleanup
-- Run these commands in Supabase SQL Editor or via CLI
-- ============================================================================

-- Enable pg_cron extension (Supabase Pro required, or use external scheduler)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- JOB 1: Aggregate Chapter Views (Every 10 minutes)
-- ============================================================================
SELECT cron.schedule(
    'aggregate-views',           -- Job name
    '*/10 * * * *',             -- Every 10 minutes
    $$ SELECT aggregate_chapter_views(); $$
);

-- ============================================================================
-- JOB 2: Reset Daily View Counts (Daily at midnight UTC)
-- ============================================================================
SELECT cron.schedule(
    'reset-daily-views',
    '0 0 * * *',                -- Daily at 00:00 UTC
    $$ SELECT reset_daily_view_counts(); $$
);

-- ============================================================================
-- JOB 3: Reset Weekly View Counts (Monday at midnight UTC)
-- ============================================================================
SELECT cron.schedule(
    'reset-weekly-views',
    '0 0 * * 1',                -- Monday at 00:00 UTC (1 = Monday)
    $$ SELECT reset_weekly_view_counts(); $$
);

-- ============================================================================
-- JOB 4: Cleanup Old Chapter Views (Daily at 2 AM UTC)
-- ============================================================================
SELECT cron.schedule(
    'cleanup-old-views',
    '0 2 * * *',                -- Daily at 02:00 UTC
    $$ SELECT cleanup_old_chapter_views(); $$
);

-- ============================================================================
-- JOB 5: Refresh Novel Statistics Materialized View (Every 15 minutes)
-- ============================================================================
SELECT cron.schedule(
    'refresh-stats',
    '*/15 * * * *',             -- Every 15 minutes
    $$ REFRESH MATERIALIZED VIEW CONCURRENTLY novel_statistics; $$
);

-- ============================================================================
-- MANAGE SCHEDULED JOBS
-- ============================================================================

-- List all scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- Unschedule a job
-- SELECT cron.unschedule('job-name');

-- ============================================================================
-- ALTERNATIVE: External Scheduler (if pg_cron not available)
-- ============================================================================
-- Use these endpoints with cron service (GitHub Actions, Vercel Cron, etc.)

-- Example: Create API route in Next.js
-- app/api/cron/aggregate-views/route.ts:
-- 
-- export async function GET(request: Request) {
--   // Verify cron secret
--   const authHeader = request.headers.get('authorization');
--   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
--     return new Response('Unauthorized', { status: 401 });
--   }
--   
--   const supabase = createClient();
--   await supabase.rpc('aggregate_chapter_views');
--   
--   return Response.json({ success: true });
-- }
--
-- Then configure external cron (e.g., Vercel Cron, GitHub Actions)
-- to hit: https://yoursite.com/api/cron/aggregate-views
-- with header: Authorization: Bearer ${CRON_SECRET}
