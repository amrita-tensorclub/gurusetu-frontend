import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:Student {id: $studentId})-[r:APPLIED_TO]->(p:ProjectOpening)
      RETURN p.id as project_id, r.status as status
    `, { studentId });

    const applications = result.records.map(r => ({
      project_opening_id: r.get('project_id'),
      status: r.get('status')
    }));

    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching applications' }, { status: 500 });
  } finally {
    await session.close();
  }
}