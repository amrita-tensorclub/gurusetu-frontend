import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      username,
      password,
      name,
      rollNumber,
      employeeId,
      departmentId,
      year,
      designation,
      areaOfInterest,
      role
    } = body;

    // Validate required fields
    if (!email || !username || !password || !name || !departmentId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'student' && !rollNumber) {
      return NextResponse.json(
        { error: 'Roll number is required for students' },
        { status: 400 }
      );
    }

    if (role === 'faculty' && !employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required for faculty' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Map department names to IDs or create department mapping
    const departmentMapping: { [key: string]: string } = {
      'aerospace': 'Aerospace Engineering',
      'ai-ds': 'Artificial Intelligence & Data Science',
      'chemical': 'Chemical Engineering',
      'civil': 'Civil Engineering',
      'cs-ai': 'Computer science and artificial intelligence',
      'cse': 'Computer Science & Engineering (including AI & ML specializations)',
      'cce': 'Computer & Communication Engineering',
      'eee': 'Electrical & Electronics Engineering',
      'ece': 'Electronics & Communication Engineering',
      'mechanical': 'Mechanical Engineering',
      'robotics': 'Robotics & Automation'
    };

    // Get or create department
    let finalDepartmentId = departmentId;
    if (departmentMapping[departmentId]) {
      // Check if department exists, if not create it
      const { data: existingDept, error: deptCheckError } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('name', departmentMapping[departmentId])
        .single();

      if (existingDept) {
        finalDepartmentId = existingDept.id;
      } else {
        // Create new department
        const { data: newDept, error: createDeptError } = await supabaseAdmin
          .from('departments')
          .insert({
            name: departmentMapping[departmentId],
            code: departmentId.toUpperCase()
          })
          .select('id')
          .single();

        if (createDeptError) {
          console.error('Department creation error:', createDeptError);
          return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
          );
        }
        
        finalDepartmentId = newDept.id;
      }
    }

    // Create user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
        role,
        roll_number: role === 'student' ? rollNumber : null
      })
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') {
        return NextResponse.json(
          { error: 'Email or username already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create role-specific record
    if (role === 'student') {
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          user_id: userData.id,
          name,
          roll_number: rollNumber,
          department_id: finalDepartmentId,
          year: parseInt(year),
          area_of_interest: areaOfInterest || null
        });

      if (studentError) {
        return NextResponse.json(
          { error: 'Failed to create student profile' },
          { status: 500 }
        );
      }
    } else {
      const { error: facultyError } = await supabaseAdmin
        .from('faculty')
        .insert({
          user_id: userData.id,
          name,
          employee_id: employeeId,
          department_id: finalDepartmentId,
          designation: designation || null,
          area_of_interest: areaOfInterest || null
        });

      if (facultyError) {
        return NextResponse.json(
          { error: 'Failed to create faculty profile' },
          { status: 500 }
        );
      }
    }

    // Return success (don't include password hash)
    const { password_hash, ...safeUserData } = userData;
    return NextResponse.json({
      success: true,
      user: safeUserData
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}