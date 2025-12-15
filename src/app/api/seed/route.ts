import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createServerClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // Create departments first
    const departments = [
      { name: 'Computer Science & Engineering', code: 'CSE' },
      { name: 'Electronics & Communication Engineering', code: 'ECE' },
      { name: 'Electrical & Electronics Engineering', code: 'EEE' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Civil Engineering', code: 'CE' }
    ];

    for (const dept of departments) {
      const { error } = await supabaseAdmin
        .from('departments')
        .upsert(dept, { onConflict: 'code' });
      if (error) console.log('Department creation error:', error);
    }

    // Get department IDs
    const { data: deptData } = await supabaseAdmin
      .from('departments')
      .select('*');

    if (!deptData || deptData.length === 0) {
      return NextResponse.json({ error: 'No departments found' }, { status: 404 });
    }

    const cseDept = deptData.find(d => d.code === 'CSE');
    const eceDept = deptData.find(d => d.code === 'ECE');

    // Create sample students
    const sampleStudents: any[] = [
      // Real student data will be created through normal registration process
    ];

    // Create users and students
    for (const studentData of sampleStudents) {
      // Create user first
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert(studentData.user, { onConflict: 'email' })
        .select()
        .single();

      if (userError) {
        console.log('User creation error:', userError);
        continue;
      }

      // Create student profile
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .upsert({
          user_id: userData.id,
          name: studentData.name,
          roll_number: studentData.roll_number,
          department_id: studentData.department_id,
          year: studentData.year,
          area_of_interest: studentData.area_of_interest
        }, { onConflict: 'user_id' });

      if (studentError) {
        console.log('Student creation error:', studentError);
      }
    }

    // Create sample faculty
    const sampleFaculty: any[] = [
      // Real faculty data will be created through normal registration process
    ];

    // Create faculty users and profiles
    for (const facultyData of sampleFaculty) {
      // Create user first
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .upsert(facultyData.user, { onConflict: 'email' })
        .select()
        .single();

      if (userError) {
        console.log('Faculty user creation error:', userError);
        continue;
      }

      // Create faculty profile
      const { error: facultyError } = await supabaseAdmin
        .from('faculty')
        .upsert({
          user_id: userData.id,
          name: facultyData.name,
          employee_id: facultyData.employee_id,
          department_id: facultyData.department_id,
          designation: facultyData.designation,
          area_of_interest: facultyData.area_of_interest,
          cabin_block: facultyData.cabin_block,
          cabin_floor: facultyData.cabin_floor,
          cabin_number: facultyData.cabin_number,
          phone_number: null,
          office_hours: 'Mon, Wed, Fri: 2 PM - 4 PM',
          ug_details: 'B.Tech in CSE, Amrita Vishwa Vidyapeetham, 2010',
          pg_details: 'M.Tech in CS, IIT Madras, 2012',
          phd_details: 'PhD in AI, IISc Bangalore, 2018'
        }, { onConflict: 'user_id' });

      if (facultyError) {
        console.log('Faculty creation error:', facultyError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data created successfully',
      departments: deptData.length,
      students: sampleStudents.length,
      faculty: sampleFaculty.length
    });

  } catch (error) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}