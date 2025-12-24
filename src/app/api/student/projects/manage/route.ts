import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const body = await request.json();
    const { action, id, studentId, ...data } = body;

    if (action === 'create') {
        const query = `
            MATCH (s:Student {id: $studentId})
            CREATE (p:StudentProject $props)
            SET p.id = randomUUID()
            CREATE (s)-[:HAS_PROJECT]->(p)
            RETURN p
        `;
        await session.run(query, { studentId, props: data });
    } else if (action === 'update') {
        const query = `
            MATCH (p:StudentProject {id: $id})
            SET p += $props
        `;
        await session.run(query, { id, props: data });
    } else if (action === 'delete') {
        await session.run(`MATCH (p:StudentProject {id: $id}) DETACH DELETE p`, { id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}