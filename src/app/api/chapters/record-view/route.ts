import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { chapterId, novelId, sessionId } = await request.json();

    if (!chapterId || !novelId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Hash IP address for privacy (GDPR-compliant)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Simple hash (in production, use crypto.subtle.digest)
    const ipHash = ip !== 'unknown' ? Buffer.from(ip).toString('base64').slice(0, 16) : null;

    // Call the record_chapter_view RPC function
    const { data, error } = await supabase.rpc('record_chapter_view', {
      p_chapter_id: chapterId,
      p_novel_id: novelId,
      p_session_id: sessionId,
      p_user_id: user?.id || null,
      p_ip_hash: ipHash,
    });

    if (error) {
      console.error('Error recording view:', error);
      return NextResponse.json(
        { error: 'Failed to record view', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, recorded: data });
  } catch (error) {
    console.error('Error in record-view API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
