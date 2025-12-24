import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; // ✅ Use Neo4j Driver

export async function GET() {
  const session = driver.session();
  try {
    // Fetch all departments ordered by name
    const result = await session.run(`
      MATCH (d:Department)
      RETURN d
      ORDER BY d.name ASC
    `);
    
    const departments = result.records.map(record => record.get('d').properties);

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Department fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

export async function POST() {
  const session = driver.session();
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
      { code: 'MBA', name: 'Master of Business Administration' },
      { code: 'AIE', name: 'Artificial Intelligence & Data Science' } 
    ];

    // Upsert departments (Merge ensures no duplicates based on Code)
    const result = await session.run(`
      UNWIND $departments AS dept
      MERGE (d:Department {code: dept.code})
      ON CREATE SET d.name = dept.name, d.id = randomUUID()
      ON MATCH SET d.name = dept.name
      RETURN d
    `, { departments: sampleDepartments });
    
    const createdDepartments = result.records.map(record => record.get('d').properties);

    return NextResponse.json({ 
      success: true, 
      message: 'Departments created/updated successfully',
      departments: createdDepartments 
    });
  } catch (error) {
    console.error('Department creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}