import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const session = driver.session();
  try {
    // 1. Fetch Faculty Profile
    const profileResult = await session.run(`
      MATCH (f:Faculty {id: $userId})-[:BELONGS_TO]->(d:Department)
      RETURN f {.*, department: d {.*}, password_hash: null} AS profile
    `, { userId });

    const profile = profileResult.records[0]?.get('profile');

    // 2. Fetch Recommended Students (Simple logic: limit 10)
    // In a real app, you would filter by area_of_interest matching
    const studentsResult = await session.run(`
      MATCH (s:Student)-[:BELONGS_TO]->(d:Department)
      RETURN s {.*, department: d {.*}, password_hash: null} AS student
      LIMIT 10
    `);

    const students = studentsResult.records.map(r => {
      const s = r.get('student');
      // Ensure user structure matches what frontend expects
      return {
        ...s,
        user: { email: s.email, username: s.username }
      };
    });

    // 3. Fetch Collaborations (Other Faculty)
    const collabResult = await session.run(`
      MATCH (f:Faculty)-[:BELONGS_TO]->(d:Department)
      WHERE f.id <> $userId
      RETURN f {.*, department: d {.*}, password_hash: null} AS faculty
      LIMIT 6
    `, { userId });

    const collaborations = collabResult.records.map(r => {
      const f = r.get('faculty');
      return {
        ...f,
        user: { email: f.email, username: f.username }
      };
    });

    return NextResponse.json({
      profile: { ...profile, user: { email: profile.email, username: profile.username } },
      students,
      collaborations
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}