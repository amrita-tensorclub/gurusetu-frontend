import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, interests } = await request.json();
    const supabaseAdmin = createServerClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // Update student interests
    const { data, error } = await supabaseAdmin
      .from('students')
      .update({ 
        area_of_interest: interests 
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      student: data,
      message: `Updated interests to: ${interests}`
    });

  } catch (error: any) {
    console.error('Update interests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createServerClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // Get current student data and projects for debugging
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('*');

    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('faculty_project_openings')
      .select(`
        *,
        faculty (
          id,
          name,
          area_of_interest
        )
      `)
      .eq('status', 'open');

    if (studentsError || projectsError) {
      return NextResponse.json({ 
        error: studentsError?.message || projectsError?.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      students,
      projects,
      message: 'Debug data retrieved'
    });

  } catch (error: any) {
    console.error('Debug data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}