import { NextRequest, NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j'; 

export async function PUT(request: NextRequest) {
  const session = driver.session();
  try {
    const body = await request.json();
    const { 
      facultyId, 
      phone_number, 
      office_hours, 
      cabin_number, 
      cabin_block,
      designation,
      area_of_interest,
      ug_details,
      pg_details,
      phd_details
    } = body;

    // Assuming facultyId here is the 'id' of the Faculty node, or we match via User ID.
    // If facultyId passed from frontend is the Node ID (UUID):
    const query = `
      MATCH (f:Faculty {id: $facultyId})
      SET f.phone_number = $phone_number,
          f.office_hours = $office_hours,
          f.cabin_number = $cabin_number,
          f.cabin_block = $cabin_block,
          f.designation = $designation,
          f.area_of_interest = $area_of_interest,
          f.ug_details = $ug_details,
          f.pg_details = $pg_details,
          f.phd_details = $phd_details,
          f.updated_at = datetime()
      RETURN f
    `;

    await session.run(query, { 
      facultyId, phone_number, office_hours, cabin_number, cabin_block, 
      designation, area_of_interest, ug_details, pg_details, phd_details 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}