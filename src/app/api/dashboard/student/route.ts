import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // This is the user.id (UUID)

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const session = driver.session();
  try {
    // 1. Fetch Student Profile
    const studentResult = await session.run(`
      MATCH (u:User {id: $userId})
      MATCH (s:Student {user_id: u.id})
      OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Department)
      RETURN s {.*, department: d {.*}, user: u { .email, .username }} AS student
    `, { userId });

    const studentData = studentResult.records[0]?.get('student');
    if (!studentData) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // 2. Fetch All Open Projects + Faculty Details
    // Note: In Supabase you had 'faculty_project_openings'. In Neo4j we'll assume a label :ProjectOpening
    const projectsResult = await session.run(`
      MATCH (p:ProjectOpening {status: 'open'})
      MATCH (f:Faculty)-[:POSTED]->(p)
      OPTIONAL MATCH (f)-[:BELONGS_TO]->(dept:Department)
      OPTIONAL MATCH (f)<-[:HAS_PROFILE]-(u:User) 
      RETURN p {
        .*,
        faculty: f {
          .*,
          department: dept {.*},
          user: u { .full_name, .email, .username }
        }
      } AS project
    `);

    const projects = projectsResult.records.map(r => {
      const p = r.get('project');
      // Normalize data structure to match what frontend expects
      return {
        ...p,
        skills_required: p.tech_stack ? p.tech_stack.split(',').map((s: string) => s.trim()) : [],
        topic: p.title, // Map title back to topic if needed by your matching logic
        faculty: {
          ...p.faculty,
          user: {
            ...p.faculty.user,
            full_name: p.faculty.name || p.faculty.user?.full_name // Ensure name exists
          }
        }
      };
    });

    return NextResponse.json({ student: studentData, projects });

  } catch (error) {
    console.error('Student Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await session.close();
  }
}