import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaintId, summary, location, urgency, notes, officerEmail } = body;

    const { data, error } = await resend.emails.send({
      from: 'PulseDilli CMS <onboarding@resend.dev>',
      to: [officerEmail || 'arindam.shandilya@gmail.com'],
      subject: `[CM Intervention] Complaint ${complaintId} — Action Required`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
          <div style="background: #1e293b; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px;">
            <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 700;">PulseDilli — CM Intervention Notice</h1>
            <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Government of NCT of Delhi</p>
          </div>

          <div style="background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; width: 120px;">COMPLAINT ID</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700;">${complaintId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">URGENCY</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${urgency === 'Critical' ? '#ef4444' : urgency === 'High' ? '#f97316' : '#e2e8f0'}; color: ${urgency === 'Critical' || urgency === 'High' ? '#fff' : '#475569'}; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;">
                    ${urgency?.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">LOCATION</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 13px;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">SUMMARY</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 13px;">${summary}</td>
              </tr>
            </table>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.05em;">CM's Intervention Notes</p>
            <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;">${notes}</p>
          </div>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 14px 20px;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              This intervention has been logged by <strong>Smt. Rekha Gupta</strong>, Chief Minister of Delhi, on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}.
              Immediate resolution is expected. Please update the Jan Samadhan portal with your action taken.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Email API error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
