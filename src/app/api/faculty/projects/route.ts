import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('facultyId');

  if (!facultyId) return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // Get projects posted by this faculty, AND count pending applications
    const query = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      MATCH (f)-[:POSTED]->(p:ProjectOpening)
      
      // Optional: Count applications
      OPTIONAL MATCH (p)<-[r:APPLIED_TO]-(s:Student)
      
      RETURN p {
        .*,
        application_count: count(r),
        pending_count: size([x IN collect(r) WHERE x.status = 'pending'])
      } as project
      ORDER BY p.created_at DESC
    `;

    const result = await session.run(query, { facultyId });
    const projects = result.records.map(r => r.get('project'));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const body = await request.json();
    const { 
      facultyId, // This is the User ID from localStorage
      topic, 
      description, 
      tech_stack, 
      expected_duration, 
      required_skills 
    } = body;

    if (!topic || !description || !facultyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Project Node and Link to Faculty
    const query = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      
      CREATE (p:ProjectOpening {
        id: randomUUID(),
        topic: $topic,
        title: $topic,
        description: $description,
        tech_stack: $tech_stack,
        required_skills: $required_skills, 
        expected_duration: $expected_duration,
        status: 'open',
        created_at: datetime()
      })
      
      CREATE (f)-[:POSTED]->(p)
      RETURN p
    `;

    await session.run(query, {
      facultyId,
      topic,
      description,
      tech_stack,
      required_skills, // Assume comma-separated string
      expected_duration
    });

    return NextResponse.json({ success: true, message: 'Project created successfully' });

  } catch (error) {
    console.error('Create Project Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) return NextResponse.json({ error: 'Project ID required'}, {status: 400});

    const session = driver.session();
    try {
        await session.run(`
            MATCH (p:ProjectOpening {id: $projectId})
            DETACH DELETE p
        `, { projectId });
        return NextResponse.json({ success: true });
    } catch(e) {
        return NextResponse.json({ error: 'Server Error'}, {status: 500});
    } finally {
        await session.close();
    }
}