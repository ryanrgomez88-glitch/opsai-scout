'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Recommendation {
  rank: number;
  title: string;
  current_state: string;
  future_state: string;
  tool: string;
  hours_saved_weekly: number;
  annual_roi: string;
  build_time: string;
  build_cost: string;
  complexity: 'low' | 'medium' | 'high';
  wow_factor: 'low' | 'medium' | 'high';
  implementation_notes: string;
}

interface QuickWin {
  title: string;
  description: string;
  timeframe: string;
  tool: string;
}

interface NextStep {
  timeframe: string;
  actions: string[];
}

interface Report {
  company: string;
  industry: string;
  company_size: string;
  assessed_by: string;
  date: string;
  executive_summary: string;
  readiness_score: number;
  readiness_rationale: string;
  total_annual_value: string;
  key_findings: string[];
  recommendations: Recommendation[];
  quick_wins: QuickWin[];
  next_steps: NextStep[];
  contact: string;
}

const complexityColor = {
  low: '#34D399',
  medium: '#FCD34D',
  high: '#F87171',
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage for freshly generated report
    const stored = sessionStorage.getItem(`report_${id}`);
    if (stored) {
      setReport(JSON.parse(stored));
      setLoading(false);
      return;
    }
    // Fall back to API
    fetch(`/api/report/${id}`)
      .then(r => r.json())
      .then(data => {
        setReport(data.report);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Intercept analyze response and store in sessionStorage
  useEffect(() => {
    const orig = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const res = await orig(...args);
      if (typeof args[0] === 'string' && args[0].includes('/api/analyze')) {
        const clone = res.clone();
        clone.json().then((data: { id: string; report: Report }) => {
          if (data.id && data.report) {
            sessionStorage.setItem(`report_${data.id}`, JSON.stringify(data.report));
          }
        }).catch(() => {});
      }
      return res;
    };
    return () => { window.fetch = orig; };
  }, []);

  const printReport = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: '#D4A847', borderTopColor: 'transparent' }} />
          <p style={{ color: '#64748B' }}>Loading your report…</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="text-center">
          <p className="text-white mb-4">Report not found.</p>
          <a href="/assessment" className="px-6 py-3 rounded-xl font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>
            Start New Assessment →
          </a>
        </div>
      </div>
    );
  }

  const scoreColor = report.readiness_score >= 70 ? '#34D399' : report.readiness_score >= 40 ? '#FCD34D' : '#F87171';

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh' }}>
      {/* Print action bar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{ background: '#0A0A0F', borderColor: '#1A1A2E' }}>
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>S</div>
          <span className="font-semibold text-white text-sm">OpsAI Scout</span>
        </a>
        <div className="flex gap-3">
          <button onClick={printReport} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#D4A847', color: '#0A0A0F' }}>
            ⬇ Download PDF
          </button>
          <a href="/assessment" className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#2A2A3E', color: '#64748B' }}>
            New Assessment
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Cover / Header */}
        <div className="rounded-2xl p-8 mb-8 border" style={{ background: '#0D1B3E', borderColor: '#2A2A3E' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>S</div>
                <span className="font-bold text-white">OpsAI Scout</span>
              </div>
              <p className="text-xs" style={{ color: '#D4A847' }}>AI Operations Assessment Report</p>
            </div>
            <div className="text-right text-xs" style={{ color: '#64748B' }}>
              <div>{report.date}</div>
              <div>{report.assessed_by}</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{report.company}</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{report.industry} · {report.company_size}</p>
        </div>

        {/* Executive Summary */}
        <div className="rounded-2xl p-6 mb-6 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Executive Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-white leading-relaxed mb-4">{report.executive_summary}</p>
              <div className="space-y-2">
                {report.key_findings?.map((finding, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94A3B8' }}>
                    <span style={{ color: '#D4A847' }}>▸</span>
                    {finding}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl" style={{ background: '#0A0A0F' }}>
              <div className="text-5xl font-bold" style={{ color: scoreColor }}>{report.readiness_score}</div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>AI Readiness Score</div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#2A2A3E' }}>
                <div className="h-full rounded-full" style={{ width: `${report.readiness_score}%`, background: scoreColor }} />
              </div>
              <p className="text-xs text-center mt-1" style={{ color: '#64748B' }}>{report.readiness_rationale}</p>
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold" style={{ color: '#D4A847' }}>{report.total_annual_value}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>Annual value identified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <h2 className="text-lg font-bold text-white mb-4">Top Automation Opportunities</h2>
        <div className="space-y-4 mb-8">
          {report.recommendations?.map((rec) => (
            <div key={rec.rank} className="rounded-2xl p-6 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: '#D4A847', color: '#0A0A0F' }}>
                  {rec.rank}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-white text-lg">{rec.title}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: complexityColor[rec.complexity] + '20', color: complexityColor[rec.complexity] }}>
                        {rec.complexity} complexity
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: '#F87171' }}>CURRENT STATE</div>
                      <p className="text-sm" style={{ color: '#94A3B8' }}>{rec.current_state}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: '#34D399' }}>FUTURE STATE</div>
                      <p className="text-sm" style={{ color: '#94A3B8' }}>{rec.future_state}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-lg font-bold" style={{ color: '#34D399' }}>{rec.hours_saved_weekly}h</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>hrs/week saved</div>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-lg font-bold" style={{ color: '#D4A847' }}>{rec.annual_roi}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>annual ROI</div>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-lg font-bold text-white">{rec.build_time}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>build time</div>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: '#0A0A0F' }}>
                      <div className="text-lg font-bold text-white">{rec.build_cost}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>build cost</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: '#60A5FA20', color: '#60A5FA' }}>🔧 {rec.tool}</span>
                    <p className="text-xs" style={{ color: '#64748B' }}>{rec.implementation_notes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Wins */}
        {report.quick_wins?.length > 0 && (
          <div className="rounded-2xl p-6 border mb-8" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>⚡ Quick Wins (This Week)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.quick_wins.map((win, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: '#0A0A0F' }}>
                  <div className="font-semibold text-white mb-1">{win.title}</div>
                  <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>{win.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: '#34D399' }}>⏱ {win.timeframe}</span>
                    <span style={{ color: '#60A5FA' }}>· {win.tool}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {report.next_steps?.length > 0 && (
          <div className="rounded-2xl p-6 border mb-8" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Next Steps — If You Start Monday</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {report.next_steps.map((step, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: '#0A0A0F' }}>
                  <div className="text-sm font-bold mb-2" style={{ color: '#D4A847' }}>{step.timeframe}</div>
                  <ul className="space-y-1">
                    {step.actions?.map((action, j) => (
                      <li key={j} className="text-xs flex items-start gap-1" style={{ color: '#94A3B8' }}>
                        <span style={{ color: '#D4A847' }}>→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA / Contact */}
        <div className="rounded-2xl p-8 border text-center" style={{ background: '#0D1B3E', borderColor: '#D4A847' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to start automating?</h2>
          <p className="mb-6" style={{ color: '#94A3B8' }}>We build the automations for you. First engagement typically pays for itself in 30 days.</p>
          <a
            href="mailto:ryan@rynojet.com"
            className="inline-block px-8 py-3 rounded-xl font-bold text-lg"
            style={{ background: '#D4A847', color: '#0A0A0F' }}
          >
            Get Started with OpsAI →
          </a>
          <p className="mt-4 text-sm" style={{ color: '#64748B' }}>{report.contact}</p>
        </div>

        <div className="mt-6 text-center text-xs" style={{ color: '#2A2A3E' }}>
          Confidential — Prepared by OpsAI Scout · {report.date}
        </div>
      </div>
    </div>
  );
}
