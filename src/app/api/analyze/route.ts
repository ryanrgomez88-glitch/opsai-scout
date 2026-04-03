import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const ANALYSIS_SYSTEM = `You are an expert operations consultant and automation architect. Analyze the conversation transcript and generate a comprehensive automation assessment report.

Return ONLY valid JSON matching this exact schema:
{
  "company": string,
  "industry": string,
  "company_size": string,
  "assessed_by": "Ryan Gomez, Ryno Jet Solutions",
  "date": string (today's date YYYY-MM-DD),
  "executive_summary": string (3-4 sentences, compelling business case),
  "readiness_score": number (0-100),
  "readiness_rationale": string,
  "total_annual_value": string (dollar amount like "$247,000"),
  "key_findings": [string, string, string],
  "recommendations": [
    {
      "rank": 1,
      "title": string,
      "current_state": string,
      "future_state": string,
      "tool": string (specific tool like "Zapier + Salesforce" or "Custom AI Agent"),
      "hours_saved_weekly": number,
      "annual_roi": string (dollar amount),
      "build_time": string (like "3-5 days"),
      "build_cost": string (like "$2,500"),
      "complexity": "low" | "medium" | "high",
      "wow_factor": "low" | "medium" | "high",
      "implementation_notes": string
    }
  ],
  "quick_wins": [
    {
      "title": string,
      "description": string,
      "timeframe": string,
      "tool": string
    }
  ],
  "next_steps": [
    { "timeframe": "Week 1", "actions": [string, string] },
    { "timeframe": "Month 1", "actions": [string, string] },
    { "timeframe": "Month 3", "actions": [string, string] }
  ],
  "contact": "ryan@rynojet.com | OpsAI"
}

Rules:
- Generate 5 recommendations minimum, ranked by impact
- Be SPECIFIC — named tools, real costs, real ROI numbers
- ROI formula: (hourly_cost × hours_saved_weekly × 52) where hourly_cost = avg $35-75/hr for operations staff
- Build costs: simple integrations $500-2K, custom agents $2-8K, complex enterprise $10-25K
- Be honest about complexity and build time
- Quick wins should be achievable in under a week
- Make the report worth printing and leaving on an executive's desk`;

export async function POST(req: NextRequest) {
  const { messages, email, companyName } = await req.json();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const conversationText = messages
    .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  // Inject server-side date so LLM never guesses wrong year
  const todayDate = new Date().toISOString().split('T')[0];

  let reportData: Record<string, unknown> = {};

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: ANALYSIS_SYSTEM,
      messages: [{
        role: 'user',
        content: `Analyze this assessment conversation and generate the report JSON:\n\n${conversationText}\n\nCompany name if known: ${companyName || 'Unknown'}\nContact email: ${email}\nToday's date (use this exactly in the "date" field): ${todayDate}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      reportData = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Analysis error:', err);
    // Fallback report
    reportData = {
      company: companyName || 'Your Company',
      industry: 'Operations',
      company_size: 'Mid-market',
      assessed_by: 'Ryan Gomez, Ryno Jet Solutions',
      date: new Date().toISOString().split('T')[0],
      executive_summary: 'Based on our conversation, we identified significant automation opportunities in your operations.',
      readiness_score: 65,
      readiness_rationale: 'Good foundation with room for automation.',
      total_annual_value: 'To be calculated',
      key_findings: ['Manual workflows consuming significant team time', 'Data scattered across multiple systems', 'Clear automation opportunities identified'],
      recommendations: [],
      quick_wins: [],
      next_steps: [],
      contact: 'ryan@rynojet.com | OpsAI',
    };
  }

  // Store in Supabase
  const id = uuidv4();

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase.from('scout_assessments').insert({
        id,
        company: reportData.company || companyName || 'Unknown',
        contact_email: email,
        conversation_json: messages,
        recommendations_json: reportData,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error('Supabase insert error (non-fatal):', dbErr);
    }
  }

  // Send email notification to Ryan
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Scout <scout@opsai.co>',
        to: ['ryan@rynojet.com'],
        subject: `New Scout Assessment: ${reportData.company || companyName || 'Unknown Company'}`,
        html: `<h2>New OpsAI Scout Assessment</h2>
<p><strong>Company:</strong> ${reportData.company}</p>
<p><strong>Contact:</strong> ${email}</p>
<p><strong>Readiness Score:</strong> ${reportData.readiness_score}/100</p>
<p><strong>Total Annual Value:</strong> ${reportData.total_annual_value}</p>
<p><strong>View report:</strong> <a href="https://opsai-scout.vercel.app/report/${id}">View Report</a></p>`,
      });
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr);
    }
  }

  return NextResponse.json({
    id,
    report: reportData,
  });
}
