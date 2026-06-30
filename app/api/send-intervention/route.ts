import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaintId, summary, location, urgency, notes, officerEmail } = body;

    // Log the intervention details server-side
    console.log('[CM Intervention] Logged:', {
      complaintId,
      summary,
      location,
      urgency,
      notes,
      officerEmail,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Intervention API error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
