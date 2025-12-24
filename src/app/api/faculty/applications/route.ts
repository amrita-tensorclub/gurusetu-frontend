import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('facultyId');

  if (!facultyId) return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // Find all projects posted by this faculty
    // Then find students who applied to those projects
    const query = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      MATCH (f)-[:POSTED]->(p:ProjectOpening)
      MATCH (s:Student)-[r:APPLIED_TO]->(p)
      
      // Optional: Get student details
      OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Department)
      OPTIONAL MATCH (s)<-[:HAS_PROFILE]-(studentUser:User)

      RETURN {
        id: r.id, // relationship doesn't always have ID, but we use proj/student ID
        status: r.status,
        applied_at: toString(r.applied_at),
        student: s {
           .*, 
           department: d.name,
           email: studentUser.email
        },
        project: p { .title, .id }
      } as application
      ORDER BY r.applied_at DESC
    `;

    const result = await session.run(query, { facultyId });
    const applications = result.records.map(r => r.get('application'));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Fetch Applications Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}