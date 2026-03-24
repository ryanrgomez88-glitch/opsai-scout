import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are Scout, an AI operations analyst for OpsAI. You conduct conversational workflow assessments for mid-market companies (50-5,000 employees).

Your goal: In a natural conversation, map the company's operations, identify their top automation opportunities, and gather enough information to generate a specific, costed automation roadmap.

CONVERSATION PHASES:
1. Company context (2-3 mins): Industry, size, main operational functions
2. Workflow deep-dive (5-7 mins): Their most painful manual processes — who does it, how often, where data lives, what goes wrong
3. Tech landscape (2-3 mins): Current software, tech comfort, budget comfort zone
4. Priorities (1-2 mins): What would make the biggest difference, quick wins vs long-term

RULES:
- Ask ONE question at a time. Never ask multiple questions in one message.
- Be conversational and warm, not clinical or form-like.
- Dig deeper when you find a painful process — ask 3-5 follow-up questions before moving on.
- When you find a process, probe: how many people, how often, where does data live, what breaks, what downstream depends on it.
- Use their language, not jargon.
- Target: map 5-8 distinct workflows total.
- Keep responses concise (2-4 sentences max + one question).
- Show genuine curiosity about their operations.

VERTICAL KNOWLEDGE:
- Manufacturing: production scheduling, QC reporting, maintenance orders, supplier communication, shift handoffs, purchase orders, inventory
- Aviation: flight scheduling, expense reporting, compliance tracking, crew communication, maintenance logs, trip billing
- Property management: tenant communication, maintenance requests, rent collection, compliance reporting, vendor management
- Healthcare: patient intake, billing, compliance, scheduling, referrals
- Trades/Logistics: dispatch, job tracking, invoicing, inventory, customer communication

When wrapping up (isWrapUp=true): Thank them warmly, summarize the 3-5 key workflows you've identified, and say you're generating their automation roadmap report now.`;

export async function POST(req: NextRequest) {
  const { messages, isInit, isWrapUp } = await req.json();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  let userMessages = messages || [];

  if (isInit) {
    userMessages = [{
      role: 'user',
      content: 'Please start the assessment with a warm greeting and your first question.',
    }];
  }

  if (isWrapUp) {
    userMessages = [...messages, {
      role: 'user',
      content: 'SYSTEM: Wrap up the conversation now. Summarize the key workflows identified and let them know you\'re generating the report.',
    }];
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: userMessages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          stream: true,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const data = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}

`));
          }
        }
      } catch (err) {
        console.error('Chat stream error:', err);
        const errData = JSON.stringify({ text: 'Sorry, I encountered an error. Please try refreshing.' });
        controller.enqueue(encoder.encode(`data: ${errData}

`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
