import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const { studentId, projectId } = await request.json();

    // Check if relationship exists
    const checkQuery = `
      MATCH (s:Student {id: $studentId})-[r:APPLIED_TO]->(p:ProjectOpening {id: $projectId})
      RETURN r
    `;
    const checkResult = await session.run(checkQuery, { studentId, projectId });
    
    if (checkResult.records.length > 0) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 }); // Simulate 23505 error
    }

    // Create Application
    await session.run(`
      MATCH (s:Student {id: $studentId})
      MATCH (p:ProjectOpening {id: $projectId})
      CREATE (s)-[r:APPLIED_TO {
        status: 'pending', 
        applied_at: datetime(),
        opening_type: 'project'
      }]->(p)
      RETURN r
    `, { studentId, projectId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apply Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}