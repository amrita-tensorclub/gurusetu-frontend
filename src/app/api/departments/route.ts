import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ departments: data });
  } catch (error) {
    console.error('Department fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Sample departments to populate the database
    const sampleDepartments = [
      { code: 'CSE', name: 'Computer Science & Engineering' },
      { code: 'ECE', name: 'Electronics & Communication Engineering' },
      { code: 'ME', name: 'Mechanical Engineering' },
      { code: 'CE', name: 'Civil Engineering' },
      { code: 'EEE', name: 'Electrical & Electronics Engineering' },
      { code: 'IT', name: 'Information Technology' },
      { code: 'CHE', name: 'Chemical Engineering' },
      { code: 'AE', name: 'Aeronautical Engineering' },
      { code: 'BT', name: 'Biotechnology' },
      { code: 'MBA', name: 'Master of Business Administration' }
    ];

    // Insert sample departments
    const { data, error } = await supabase
      .from('departments')
      .upsert(sampleDepartments, { onConflict: 'code' })
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create departments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Departments created successfully',
      departments: data 
    });
  } catch (error) {
    console.error('Department creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}