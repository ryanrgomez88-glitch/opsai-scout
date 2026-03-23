# OpsAI Scout — Workflow Intelligence Platform

> "20 minutes to your automation roadmap."

A web-based AI operations consultant that:
1. Has a natural conversation about your operations
2. Identifies the top 5+ automation opportunities with real ROI numbers
3. Delivers a professional PDF report instantly
4. Can demonstrate automation #1 working live

## Stack

- **Next.js 15** + TypeScript + Tailwind CSS v4
- **Claude Sonnet** (streaming) via Anthropic API
- **Supabase** — store assessments and leads
- **Resend** — email delivery of reports
- **Vercel** — deployment

## Environment Variables

```
ANTHROPIC_API_KEY=...
SUPABASE_URL=https://dgqscihotvokxeimwybe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
```

## Routes

- `/` — Landing page
- `/assessment` — Conversational assessment interface
- `/report/[id]` — Generated report (shareable, printable)
- `/admin` — Ryan's lead dashboard

## Supabase Schema

```sql
CREATE TABLE scout_assessments (
  id UUID PRIMARY KEY,
  company TEXT,
  contact_email TEXT,
  conversation_json JSONB,
  recommendations_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage

Walk into any mid-market company with a laptop, open the URL, run the assessment. Get a PDF report in 20 minutes that a McKinsey partner would be proud to leave behind.

---

*Built by Forge 🔨 for Ryno Jet Solutions · OpsAI Phase 3*
