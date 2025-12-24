import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('id');

  if (!studentId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // Fetch Student + Department + User Info
    // Also fetch their Personal Projects
    const query = `
      MATCH (s:Student {id: $studentId})
      OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Department)
      OPTIONAL MATCH (u:User {id: s.user_id})
      
      // Fetch Personal Projects
      OPTIONAL MATCH (s)-[:HAS_PROJECT]->(p:StudentProject)

      RETURN s {
        .*,
        department: d { .name, .code },
        email: u.email,
        projects: collect(DISTINCT p {.*})
      } as profile
    `;

    const result = await session.run(query, { studentId });
    
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const profile = result.records[0].get('profile');

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Fetch Student Profile Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}