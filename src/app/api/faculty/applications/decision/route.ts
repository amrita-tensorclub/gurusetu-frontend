import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const { projectId, studentId, status } = await request.json();

    const query = `
      MATCH (s:Student {id: $studentId})-[r:APPLIED_TO]->(p:ProjectOpening {id: $projectId})
      SET r.status = $status, r.responded_at = datetime()
      RETURN r
    `;

    await session.run(query, { projectId, studentId, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}