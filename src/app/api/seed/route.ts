import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createServerClient();

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
    const sampleStudents = [
      {
        name: 'Priya Sharma',
        roll_number: 'CSE001',
        department_id: cseDept?.id,
        year: 3,
        area_of_interest: 'Machine Learning, Computer Vision, Python, Data Science',
        user: {
          email: 'priya.sharma@example.com',
          username: 'priya_sharma',
          password_hash: 'hashed_password',
          role: 'student'
        }
      },
      {
        name: 'Rahul Verma',
        roll_number: 'ECE002', 
        department_id: eceDept?.id,
        year: 4,
        area_of_interest: 'Embedded Systems, IoT, C++, Electronics Design',
        user: {
          email: 'rahul.verma@example.com',
          username: 'rahul_verma',
          password_hash: 'hashed_password',
          role: 'student'
        }
      },
      {
        name: 'Ananya Gupta',
        roll_number: 'CSE003',
        department_id: cseDept?.id,
        year: 2,
        area_of_interest: 'Web Development, JavaScript, React, Node.js',
        user: {
          email: 'ananya.gupta@example.com',
          username: 'ananya_gupta',
          password_hash: 'hashed_password',
          role: 'student'
        }
      },
      {
        name: 'Vikram Singh',
        roll_number: 'ECE004',
        department_id: eceDept?.id,
        year: 3,
        area_of_interest: 'Robotics, Automation, Control Systems, MATLAB',
        user: {
          email: 'vikram.singh@example.com',
          username: 'vikram_singh',
          password_hash: 'hashed_password',
          role: 'student'
        }
      }
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
    const sampleFaculty = [
      {
        name: 'Meera Reddy',
        employee_id: 'FAC001',
        department_id: eceDept?.id,
        designation: 'Assistant Professor',
        area_of_interest: 'Renewable Energy, Smart Grid, Power Electronics',
        cabin_block: 'EE Block',
        cabin_floor: 2,
        cabin_number: '201',
        user: {
          email: 'meera.reddy@college.edu',
          username: 'meera_reddy',
          password_hash: 'hashed_password',
          role: 'faculty'
        }
      },
      {
        name: 'Anand Singh',
        employee_id: 'FAC002',
        department_id: cseDept?.id,
        designation: 'Professor',
        area_of_interest: 'Urban Mobility, Smart Transportation, AI in Civil Engineering',
        cabin_block: 'CS Block',
        cabin_floor: 3,
        cabin_number: '305',
        user: {
          email: 'anand.singh@college.edu',
          username: 'anand_singh',
          password_hash: 'hashed_password',
          role: 'faculty'
        }
      }
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