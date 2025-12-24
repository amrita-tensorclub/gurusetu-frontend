import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { driver } from '@/lib/neo4j'; // ✅ Use Neo4j Driver

export async function POST(request: NextRequest) {
  const session = driver.session();
  
  try {
    const body = await request.json();
    const { emailOrRoll, password, role } = body;

    if (!emailOrRoll || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Find User by Email OR Roll Number (using Neo4j)
    // We search for a User node that is linked to a Student/Faculty profile
    const findUserQuery = `
      MATCH (u:User {role: $role})
      WHERE u.email = $emailOrRoll 
         OR u.username = $emailOrRoll
         OR exists {
            MATCH (u)-[:HAS_PROFILE]->(p)
            WHERE p.roll_number = $emailOrRoll
         }
      RETURN u
    `;

    const result = await session.run(findUserQuery, { 
      role, 
      emailOrRoll 
    });

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials or user not found' },
        { status: 401 }
      );
    }

    const userNode = result.records[0].get('u').properties;

    // 2. Verify Password
    const isValid = await bcrypt.compare(password, userNode.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. Fetch Full Profile (Student or Faculty) + Department
    let profileData = null;
    
    if (role === 'student') {
        const studentQuery = `
            MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(s:Student)
            OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Department)
            RETURN s { .* , department: d { .name, .code } } as profile
        `;
        const profileRes = await session.run(studentQuery, { userId: userNode.id });
        if (profileRes.records.length > 0) {
            profileData = profileRes.records[0].get('profile');
        }
    } else {
        const facultyQuery = `
            MATCH (u:User {id: $userId})-[:HAS_PROFILE]->(f:Faculty)
            OPTIONAL MATCH (f)-[:BELONGS_TO]->(d:Department)
            RETURN f { .* , department: d { .name, .code } } as profile
        `;
        const profileRes = await session.run(facultyQuery, { userId: userNode.id });
        if (profileRes.records.length > 0) {
            profileData = profileRes.records[0].get('profile');
        }
    }

    // 4. Return Success
    // Remove password hash before sending to frontend
    const { password_hash, ...safeUser } = userNode;

    return NextResponse.json({
      success: true,
      user: safeUser,
      profile: profileData
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}