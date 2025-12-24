import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

// CREATE Item
export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const body = await request.json();
    const { facultyId, type, ...data } = body;

    let query = '';
    let label = '';
    let rel = '';

    if (type === 'project') {
        label = 'PreviousProject';
        rel = 'HAS_WORK';
    } else if (type === 'paper') {
        label = 'ResearchPaper';
        rel = 'PUBLISHED';
    } else if (type === 'opening_project') {
        label = 'ProjectOpening';
        rel = 'POSTED';
    } else if (type === 'opening_research') {
        label = 'ResearchOpening';
        rel = 'POSTED';
    }

    query = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      CREATE (n:${label} $props)
      SET n.id = randomUUID()
      CREATE (f)-[:${rel}]->(n)
      RETURN n
    `;

    await session.run(query, { facultyId, props: data });
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}

// DELETE Item
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const session = driver.session();
  try {
    await session.run(`MATCH (n {id: $id}) DETACH DELETE n`, { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}