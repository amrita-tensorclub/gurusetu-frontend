import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // 1. Fetch Personal Projects
    // Assuming a model: (Student)-[:CREATED]->(Project)
    // Or if you store them as properties/JSON, adjust accordingly. 
    // Here we assume a Node :StudentProject
    const personalQuery = `
      MATCH (s:Student {id: $studentId})-[:HAS_PROJECT]->(p:StudentProject)
      RETURN p { .* } as project
      ORDER BY p.year DESC
    `;
    
    const personalResult = await session.run(personalQuery, { studentId });
    const personalProjects = personalResult.records.map(r => r.get('project'));

    // 2. Fetch Accepted Faculty Projects
    // Path: (Student)-[r:APPLIED_TO {status:'accepted'}]->(Opening)<-[:POSTED]-(Faculty)-[:BELONGS_TO]->(Dept)
    const acceptedQuery = `
      MATCH (s:Student {id: $studentId})-[r:APPLIED_TO]->(p:ProjectOpening)
      WHERE r.status = 'accepted'
      
      MATCH (p)<-[:POSTED]-(f:Faculty)
      OPTIONAL MATCH (f)-[:BELONGS_TO]->(d:Department)
      
      RETURN {
        id: r.id, 
        status: r.status,
        applied_date: toString(r.applied_at),
        response_date: toString(r.responded_at),
        project: p {
          .*,
          faculty: f {
            name: f.name,
            designation: f.designation,
            departments: d { name: d.name }
          }
        }
      } as application
      ORDER BY r.responded_at DESC
    `;

    const acceptedResult = await session.run(acceptedQuery, { studentId });
    const acceptedProjects = acceptedResult.records.map(r => r.get('application'));

    return NextResponse.json({
      personal: personalProjects,
      accepted: acceptedProjects
    });

  } catch (error) {
    console.error('Error fetching student projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}