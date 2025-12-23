import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrRoll, password, role } = body;

    if (!emailOrRoll || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user by email or roll number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .or(`email.eq.${emailOrRoll},roll_number.eq.${emailOrRoll}`)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, userData.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get additional profile data
    let profileData = null;
    if (role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .eq('user_id', userData.id)
        .single();
      profileData = studentData;
    } else {
      const { data: facultyData } = await supabase
        .from('faculty')
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .eq('user_id', userData.id)
        .single();
      profileData = facultyData;
    }

    // Return success (don't include password hash)
    const { password_hash, ...safeUserData } = userData;
    return NextResponse.json({
      success: true,
      user: safeUserData,
      profile: profileData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}