import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAggregateMetrics } from '@/services/complaints';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI_API_KEY is not configured.' }, { status: 500 });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Get real metrics
    const metrics = await getAggregateMetrics();

    // Prepare prompt
    const prompt = `
You are an expert civic governance analyst for the PulseDilli dashboard (Delhi-PS-CRM).
Based on the following live dashboard metrics, generate a "Daily Governance Brief" (Executive Summary).
Maintain a high-level, actionable, and data-driven tone. Emphasize potential bottlenecks, highlight resolution rates, and mention trends.
Keep it strictly under 3-4 sentences. It will be displayed in the UI. Do NOT use markdown like asterisks or bold text, just plain text.

Metrics:
Total Pending Complaints: ${metrics.pending}
Total Resolved Complaints: ${metrics.resolved}
Total Complaints Ever: ${metrics.total}
Resolution Rate: ${metrics.total > 0 ? ((metrics.resolved / metrics.total) * 100).toFixed(1) : 0}%
Average Resolution Time (days): ${metrics.avgResolutionDays ?? 'N/A'}
Critical Open Complaints: ${metrics.critical}
`;

    const result = await model.generateContent(prompt);
    const summaryText = result.response.text().trim();

    // Audit Logging
    console.log('[Audit Log] AI Executive Summary Generated:', {
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-flash',
      metrics: metrics
    });

    return NextResponse.json({ success: true, summary: summaryText, metrics });
  } catch (err) {
    console.error('AI Report generation error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
