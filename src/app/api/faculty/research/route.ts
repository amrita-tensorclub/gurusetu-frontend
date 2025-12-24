import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('facultyId'); // This is the User ID

  if (!facultyId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // 1. Get Faculty Node (for Interests)
    // 2. Get Openings (Project & Research)
    // 3. Get Previous Work (Projects)
    // 4. Get Publications (Papers)
    
    const query = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      
      // Get Openings
      OPTIONAL MATCH (f)-[:POSTED]->(o:Opening)
      
      // Get Previous Work
      OPTIONAL MATCH (f)-[:HAS_WORK]->(w:Work)
      
      // Get Papers
      OPTIONAL MATCH (f)-[:PUBLISHED]->(p:Paper)
      
      RETURN f.area_of_interest as interests,
             collect(DISTINCT o {.*, type: labels(o)[1]}) as openings, 
             collect(DISTINCT w {.*}) as projects,
             collect(DISTINCT p {.*}) as papers
    `;
    
    // Note: In Neo4j we might label openings as :Opening:ProjectOpening to distinguish
    // For simplicity, we assume generic nodes with a 'type' property or label handling.

    // Let's use specific labels for cleaner graph: 
    // :ProjectOpening, :ResearchOpening
    // :PreviousProject
    // :ResearchPaper

    const robustQuery = `
      MATCH (u:User {id: $facultyId})
      MATCH (f:Faculty {user_id: u.id})
      
      OPTIONAL MATCH (f)-[:POSTED]->(po:ProjectOpening)
      OPTIONAL MATCH (f)-[:POSTED]->(ro:ResearchOpening)
      OPTIONAL MATCH (f)-[:HAS_WORK]->(pp:PreviousProject)
      OPTIONAL MATCH (f)-[:PUBLISHED]->(rp:ResearchPaper)
      
      RETURN f.area_of_interest as interests,
             collect(DISTINCT po {.*, type: 'project'}) + collect(DISTINCT ro {.*, type: 'research'}) as openings,
             collect(DISTINCT pp {.*}) as projects,
             collect(DISTINCT rp {.*}) as papers
    `;

    const result = await session.run(robustQuery, { facultyId });
    const record = result.records[0];

    return NextResponse.json({
      interests: record.get('interests') || '',
      openings: record.get('openings'),
      projects: record.get('projects'),
      papers: record.get('papers')
    });

  } catch (error) {
    console.error('Fetch Research Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}