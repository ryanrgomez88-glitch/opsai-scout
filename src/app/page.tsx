'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [hovering, setHovering] = useState(false);

  const stats = [
    { value: '20 min', label: 'Average assessment' },
    { value: '5', label: 'Automation opportunities identified' },
    { value: '70-90%', label: 'Manual work eliminated' },
    { value: '$0', label: 'Cost to get started' },
  ];

  const verticals = [
    { icon: '🏭', name: 'Manufacturing', examples: 'Production scheduling, QC, maintenance orders' },
    { icon: '✈️', name: 'Aviation', examples: 'Flight scheduling, compliance, crew comms' },
    { icon: '🏢', name: 'Property Management', examples: 'Tenant comms, maintenance, reporting' },
    { icon: '🏥', name: 'Healthcare', examples: 'Patient intake, billing, compliance' },
    { icon: '🔧', name: 'Trades & Logistics', examples: 'Dispatch, invoicing, job tracking' },
    { icon: '📊', name: 'Any Industry', examples: 'We map your specific workflows' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1A1A2E' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>
            S
          </div>
          <span className="font-bold text-white text-lg">OpsAI Scout</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-sm" style={{ color: '#64748B' }}>Admin</a>
          <button
            onClick={() => router.push('/assessment')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#D4A847', color: '#0A0A0F' }}
          >
            Start Assessment
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border" style={{ background: '#1A1A2E', borderColor: '#D4A847', color: '#D4A847' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#D4A847' }} />
          AI Operations Analysis · Free Assessment
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          20 minutes to your
          <br />
          <span style={{ color: '#D4A847' }}>automation roadmap.</span>
        </h1>

        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: '#94A3B8' }}>
          Scout has a natural conversation about your operations, identifies your top 5 automation opportunities with real ROI numbers, and delivers a professional report instantly — before you leave the room.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => router.push('/assessment')}
            className="px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 shadow-lg"
            style={{
              background: hovering ? '#F0C94A' : '#D4A847',
              color: '#0A0A0F',
              boxShadow: hovering ? '0 0 30px rgba(212,168,71,0.4)' : '0 0 15px rgba(212,168,71,0.2)',
              transform: hovering ? 'translateY(-1px)' : 'none',
            }}
          >
            Start Free Assessment →
          </button>
          <button
            onClick={() => router.push('/assessment')}
            className="px-8 py-4 rounded-xl text-lg font-medium border transition-all"
            style={{ borderColor: '#2A2A3E', color: '#94A3B8' }}
          >
            See Sample Report
          </button>
        </div>

        <p className="mt-4 text-sm" style={{ color: '#475569' }}>No signup required · Takes 15-20 minutes · PDF delivered instantly</p>
      </div>

      {/* Stats bar */}
      <div className="border-y" style={{ borderColor: '#1A1A2E' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#D4A847' }}>{s.value}</div>
              <div className="text-sm mt-1" style={{ color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">How Scout Works</h2>
        <p className="text-center mb-12" style={{ color: '#64748B' }}>No forms. No generic recommendations. Just a focused conversation that maps your real workflows.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Tell Scout About Your Business', desc: 'Industry, team size, main operational functions. 2-3 minutes.' },
            { step: '02', title: 'Deep-Dive on Pain Points', desc: 'Scout asks smart follow-up questions about your most painful workflows.' },
            { step: '03', title: 'AI Analysis', desc: 'Claude Sonnet analyzes your operations against proven automation patterns with real ROI calculations.' },
            { step: '04', title: 'Instant PDF Report', desc: 'Professional McKinsey-quality report with your top 5 automation opportunities, costs, and next steps.' },
          ].map((step) => (
            <div key={step.step} className="rounded-xl p-5 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
              <div className="text-xs font-bold mb-3" style={{ color: '#D4A847' }}>{step.step}</div>
              <div className="font-semibold text-white mb-2">{step.title}</div>
              <div className="text-sm" style={{ color: '#64748B' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry verticals */}
      <div className="border-t" style={{ borderColor: '#1A1A2E' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Built for Every Industry</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {verticals.map((v) => (
              <div key={v.name} className="rounded-xl p-4 border" style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}>
                <div className="text-2xl mb-2">{v.icon}</div>
                <div className="font-semibold text-white mb-1">{v.name}</div>
                <div className="text-xs" style={{ color: '#64748B' }}>{v.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t" style={{ borderColor: '#1A1A2E' }}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to find your automation wins?</h2>
          <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
            Join companies saving thousands of hours per year with AI automation.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="px-10 py-4 rounded-xl text-lg font-bold transition-all duration-200"
            style={{ background: '#D4A847', color: '#0A0A0F' }}
          >
            Start Your Free Assessment →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-6 flex justify-between items-center text-sm" style={{ borderColor: '#1A1A2E', color: '#475569' }}>
        <span>© 2026 OpsAI · Powered by Ryno Jet Solutions</span>
        <a href="mailto:ryan@rynojet.com" style={{ color: '#D4A847' }}>ryan@rynojet.com</a>
      </div>
    </div>
  );
}
