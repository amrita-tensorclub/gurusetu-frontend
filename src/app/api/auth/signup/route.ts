import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { driver } from '@/lib/neo4j'; // ✅ Use Neo4j Driver
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid: npm install uuid @types/uuid

export async function POST(request: NextRequest) {
  const session = driver.session();
  
  try {
    const body = await request.json();
    const {
      email,
      username,
      password,
      name,
      rollNumber, // For Student
      employeeId, // For Faculty
      departmentId,
      year, // For Student
      designation, // For Faculty
      areaOfInterest,
      role
    } = body;

    // 1. Basic Validation
    if (!email || !username || !password || !name || !departmentId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'student' && !rollNumber) {
      return NextResponse.json({ error: 'Roll number is required for students' }, { status: 400 });
    }

    if (role === 'faculty' && !employeeId) {
      return NextResponse.json({ error: 'Employee ID is required for faculty' }, { status: 400 });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Department Mapping (Same logic as yours)
    const departmentMapping: { [key: string]: string } = {
      'aerospace': 'Aerospace Engineering',
      'ai-ds': 'Artificial Intelligence & Data Science',
      'chemical': 'Chemical Engineering',
      'civil': 'Civil Engineering',
      'cs-ai': 'Computer science and artificial intelligence',
      'cse': 'Computer Science & Engineering',
      'cce': 'Computer & Communication Engineering',
      'eee': 'Electrical & Electronics Engineering',
      'ece': 'Electronics & Communication Engineering',
      'mechanical': 'Mechanical Engineering',
      'robotics': 'Robotics & Automation'
    };

    const deptName = departmentMapping[departmentId] || departmentId; // Fallback to ID if not in map
    const deptCode = departmentId.toUpperCase();

    // 4. Create User Transaction
    // We use a transaction to ensure User + Profile + Department links are created atomically.
    const result = await session.executeWrite(async (tx) => {
      
      // A. Check if user exists
      const checkUser = await tx.run(`
        MATCH (u:User)
        WHERE u.email = $email OR u.username = $username
        RETURN u
      `, { email, username });

      if (checkUser.records.length > 0) {
        throw new Error('Email or username already exists');
      }

      // B. Create User Node
      const userId = uuidv4();
      await tx.run(`
        CREATE (u:User {
          id: $id,
          email: $email,
          username: $username,
          password_hash: $passwordHash,
          role: $role,
          created_at: datetime()
        })
      `, { id: userId, email, username, passwordHash, role });

      // C. Ensure Department Node Exists
      // MERGE creates it if it doesn't exist, matches it if it does
      await tx.run(`
        MERGE (d:Department {code: $deptCode})
        ON CREATE SET d.name = $deptName, d.id = randomUUID()
      `, { deptCode, deptName });

      // D. Create Specific Profile (Student or Faculty)
      if (role === 'student') {
        const studentId = uuidv4();
        await tx.run(`
          MATCH (u:User {id: $userId})
          MATCH (d:Department {code: $deptCode})
          CREATE (s:Student {
            id: $studentId,
            name: $name,
            roll_number: $rollNumber,
            year: $year,
            area_of_interest: $areaOfInterest,
            user_id: $userId
          })
          CREATE (u)-[:HAS_PROFILE]->(s)
          CREATE (s)-[:BELONGS_TO]->(d)
        `, { userId, deptCode, studentId, name, rollNumber, year: parseInt(year), areaOfInterest });
      } 
      else if (role === 'faculty') {
        const facultyId = uuidv4();
        await tx.run(`
          MATCH (u:User {id: $userId})
          MATCH (d:Department {code: $deptCode})
          CREATE (f:Faculty {
            id: $facultyId,
            name: $name,
            employee_id: $employeeId,
            designation: $designation,
            area_of_interest: $areaOfInterest,
            user_id: $userId
          })
          CREATE (u)-[:HAS_PROFILE]->(f)
          CREATE (f)-[:BELONGS_TO]->(d)
        `, { userId, deptCode, facultyId, name, employeeId, designation, areaOfInterest });
      }

      return { userId, email, role, name };
    });

    return NextResponse.json({
      success: true,
      user: result
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'Email or username already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}