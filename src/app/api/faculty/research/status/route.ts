import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function POST(request: NextRequest) {
  const session = driver.session();
  try {
    const { id, status } = await request.json();
    await session.run(`MATCH (n {id: $id}) SET n.status = $status`, { id, status });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}