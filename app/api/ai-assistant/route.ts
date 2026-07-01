import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllComplaintsData } from '@/services/complaints';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI_API_KEY is not configured.' }, { status: 500 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required.' }, { status: 400 });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Fetch complaints data as context
    const complaints = await getAllComplaintsData();

    // To prevent exceeding context limits even with flash, we'll map to a smaller subset of fields
    const minimizedData = complaints.map(c => ({
      ticket: c.ticket_id,
      title: c.title,
      status: c.status,
      severity: c.severity,
      city: c.city,
      created: c.created_at,
      category: c.categories?.name,
      department: c.categories?.department
    }));

    const prompt = `
You are an expert AI Report Assistant for the Chief Minister's Office (Delhi-PS-CRM).
You have been asked the following question/request: "${query}"

Here is the raw data of recent complaints in JSON format. Use this data to answer the query accurately. 
Be concise, analytical, and professional. Highlight key trends, bottlenecks, or specific numbers if relevant.
Do NOT output markdown code blocks unless strictly necessary. Provide a clean, readable text response.

Raw Data:
${JSON.stringify(minimizedData)}
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    // Audit Logging
    console.log('[Audit Log] AI Assistant Query Processed:', {
      timestamp: new Date().toISOString(),
      query,
      model: 'gemini-2.5-flash'
    });

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    console.error('AI Assistant error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
