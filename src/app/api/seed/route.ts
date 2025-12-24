import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; // ✅ Use Neo4j Driver
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const session = driver.session();
  
  try {
    // 1. Create Departments
    const departments = [
      { name: 'Computer Science & Engineering', code: 'CSE' },
      { name: 'Electronics & Communication Engineering', code: 'ECE' },
      { name: 'Electrical & Electronics Engineering', code: 'EEE' },
      { name: 'Mechanical Engineering', code: 'ME' },
      { name: 'Civil Engineering', code: 'CE' },
      { name: 'Artificial Intelligence & Data Science', code: 'AIE' },
      { name: 'Aerospace Engineering', code: 'AE' }
    ];

    console.log('🌱 Seeding Departments...');
    await session.run(`
      UNWIND $departments AS dept
      MERGE (d:Department {code: dept.code})
      ON CREATE SET d.name = dept.name, d.id = randomUUID()
      ON MATCH SET d.name = dept.name
    `, { departments });

    // 2. Create Sample Users (Optional: Add actual dummy data here if you want)
    // For now, we will just log that departments are ready.
    // If you want to add specific dummy users, you can follow the pattern below:
    
    /*
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create a Sample Student
    await session.run(`
        MERGE (u:User {email: 'student@amrita.edu'})
        ON CREATE SET 
            u.id = randomUUID(),
            u.username = 'student1',
            u.password_hash = $hash,
            u.role = 'student',
            u.created_at = datetime()
        
        WITH u
        MATCH (d:Department {code: 'CSE'})
        MERGE (s:Student {roll_number: 'CB.EN.U4CSE21001'})
        ON CREATE SET 
            s.id = randomUUID(),
            s.name = 'Rahul Kumar',
            s.year = 3,
            s.area_of_interest = 'Web Development, AI',
            s.user_id = u.id
        
        MERGE (u)-[:HAS_PROFILE]->(s)
        MERGE (s)-[:BELONGS_TO]->(d)
    `, { hash: passwordHash });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      departmentsCreated: departments.length
    });

  } catch (error: any) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data: ' + error.message },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}