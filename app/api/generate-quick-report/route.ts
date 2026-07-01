import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllComplaintsData } from '@/services/complaints';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI_API_KEY is not configured.' }, { status: 500 });
    }

    const { type } = await req.json();
    if (!type) {
      return NextResponse.json({ success: false, error: 'Report type is required.' }, { status: 400 });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Fetch complaints data as context
    const complaints = await getAllComplaintsData();

    // Limit context for performance while still giving a good sample
    const minimizedData = complaints.slice(0, 500).map(c => ({
      ticket: c.ticket_id,
      status: c.status,
      severity: c.severity,
      city: c.city,
      created: c.created_at,
      category: c.categories?.name,
      department: c.categories?.department
    }));

    const prompt = `
You are an expert AI Report Generator for the Chief Minister's Office (Delhi-PS-CRM).
You need to generate a structured text report of type: "${type}".

Here is a sample of the most recent complaints data in JSON format:
${JSON.stringify(minimizedData)}

Based on this data, write a comprehensive 3-5 paragraph report suitable for a PDF export. 
Include headings, key statistics, and actionable insights relevant to the requested report type.
Do NOT use markdown bold/italics syntax (e.g. asterisks) since this text will be directly embedded in a plain PDF. You can use ALL CAPS for headings.
`;

    const result = await model.generateContent(prompt);
    const reportText = result.response.text().trim();

    // Audit Logging
    console.log(`[Audit Log] Quick Report Generated: ${type}`, {
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-flash'
    });

    return NextResponse.json({ success: true, reportText });
  } catch (err) {
    console.error('Quick Report generation error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
