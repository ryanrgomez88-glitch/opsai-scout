'use client';

import { useEffect, useState } from 'react';

interface Assessment {
  id: string;
  company: string;
  contact_email: string;
  created_at: string;
  recommendations_json?: {
    readiness_score?: number;
    total_annual_value?: string;
    recommendations?: { title: string }[];
  };
}

export default function AdminPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/assessments')
      .then(r => r.json())
      .then(d => { setAssessments(d.assessments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ background: '#0A0A0F' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>S</div>
              <span className="font-bold text-white">OpsAI Scout</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <a href="/" className="text-sm" style={{ color: '#64748B' }}>← Back to Scout</a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-4 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
            <div className="text-2xl font-bold text-white">{assessments.length}</div>
            <div className="text-xs" style={{ color: '#64748B' }}>Total Assessments</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
            <div className="text-2xl font-bold" style={{ color: '#34D399' }}>
              {assessments.filter(a => a.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
            </div>
            <div className="text-xs" style={{ color: '#64748B' }}>This Week</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
            <div className="text-2xl font-bold" style={{ color: '#D4A847' }}>
              {assessments.length > 0
                ? Math.round(assessments.reduce((sum, a) => sum + (a.recommendations_json?.readiness_score || 0), 0) / assessments.length)
                : 0}
            </div>
            <div className="text-xs" style={{ color: '#64748B' }}>Avg Readiness Score</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#64748B' }}>Loading assessments…</div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-20 rounded-xl border" style={{ borderColor: '#2A2A3E', color: '#64748B' }}>
            <p className="text-4xl mb-4">📋</p>
            <p>No assessments yet. <a href="/assessment" style={{ color: '#D4A847' }}>Run the first one →</a></p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#2A2A3E' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#2A2A3E', background: '#1A1A2E' }}>
                  {['Company', 'Contact', 'Score', 'Value', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr key={a.id} className="border-b" style={{ borderColor: '#2A2A3E', background: i % 2 === 0 ? '#0A0A0F' : '#1A1A2E' }}>
                    <td className="px-4 py-3 font-medium text-white">{a.company}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#64748B' }}>{a.contact_email}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold" style={{ color: '#D4A847' }}>
                        {a.recommendations_json?.readiness_score || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#34D399' }}>
                      {a.recommendations_json?.total_annual_value || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748B' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/report/${a.id}`} className="text-xs px-3 py-1 rounded-lg" style={{ background: '#1A1A2E', color: '#D4A847', border: '1px solid #D4A847' }}>
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
