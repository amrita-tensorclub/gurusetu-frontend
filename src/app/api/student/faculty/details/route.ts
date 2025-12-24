import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('id');

  if (!facultyId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // Fetch Faculty + Department + User Info
    // Also fetch Openings, Projects, and Papers connected to them
    const query = `
      MATCH (f:Faculty {id: $facultyId})
      OPTIONAL MATCH (f)-[:BELONGS_TO]->(d:Department)
      OPTIONAL MATCH (u:User {id: f.user_id})
      
      // Fetch Openings (Projects & Research)
      OPTIONAL MATCH (f)-[:POSTED]->(o:ProjectOpening)
      OPTIONAL MATCH (f)-[:POSTED]->(ro:ResearchOpening)
      
      // Fetch Previous Work
      OPTIONAL MATCH (f)-[:HAS_WORK]->(w:PreviousProject)
      OPTIONAL MATCH (f)-[:PUBLISHED]->(p:ResearchPaper)

      RETURN f {
        .*,
        department: d { .name, .code },
        email: u.email,
        openings: collect(DISTINCT o {.*, type: 'project'}) + collect(DISTINCT ro {.*, type: 'research'}),
        projects: collect(DISTINCT w {.*}),
        papers: collect(DISTINCT p {.*})
      } as profile
    `;

    const result = await session.run(query, { facultyId });
    
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    const profile = result.records[0].get('profile');

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}