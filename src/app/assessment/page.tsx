'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [phase, setPhase] = useState<'chat' | 'email' | 'done'>('chat');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    setStarted(true);
    setIsStreaming(true);
    const initMsg: Message = { role: 'assistant', content: '' };
    setMessages([initMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], isInit: true }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setMessages([{ role: 'assistant', content: fullText }]);
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
      setMessageCount(1);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const newCount = messageCount + 1;
    setMessageCount(newCount);

    // After ~12 exchanges, trigger analysis
    if (newCount >= 12) {
      // Add assistant message then trigger analysis
      const assistantMsg: Message = { role: 'assistant', content: '' };
      setMessages([...newMessages, assistantMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, isWrapUp: true }),
        });

        if (res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.text) {
                    fullText += data.text;
                    setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: fullText }]);
                  }
                } catch { /* ignore */ }
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsStreaming(false);
        // Transition to email capture
        setTimeout(() => setPhase('email'), 1500);
      }
      return;
    }

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: fullText }]);
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateReport = async () => {
    if (!email.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, email, companyName }),
      });
      const data = await res.json();
      if (data.id) {
        setAssessmentId(data.id);
        setPhase('done');
        router.push(`/report/${data.id}`);
      }
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
  };

  const progress = Math.min(Math.round((messageCount / 12) * 100), 95);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1A1A2E' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>S</div>
            <span className="font-semibold text-white">OpsAI Scout</span>
          </a>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1A1A2E', color: '#64748B' }}>Assessment in progress</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs" style={{ color: '#64748B' }}>{progress}% complete</div>
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#1A1A2E' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#D4A847' }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {!started ? (
          // Welcome screen
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold" style={{ background: '#D4A847', color: '#0A0A0F' }}>
              S
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Hi, I&apos;m Scout</h1>
              <p className="text-lg max-w-md" style={{ color: '#94A3B8' }}>
                Your AI operations analyst. In about 20 minutes, I&apos;ll map your workflows and identify your top automation opportunities — with real ROI numbers.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm" style={{ color: '#64748B' }}>
              <div>✓ No forms or surveys — just a natural conversation</div>
              <div>✓ Specific recommendations for your industry</div>
              <div>✓ Professional PDF report delivered at the end</div>
            </div>
            <button
              onClick={startConversation}
              className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:opacity-90"
              style={{ background: '#D4A847', color: '#0A0A0F' }}
            >
              Start Assessment →
            </button>
          </div>
        ) : phase === 'email' ? (
          // Email capture
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#1A1A2E' }}>📋</div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
              <p className="max-w-md" style={{ color: '#94A3B8' }}>
                I&apos;ve analyzed your operations. Enter your details below and I&apos;ll generate your custom automation roadmap report.
              </p>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-4">
              <input
                type="text"
                placeholder="Company name (optional)"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-white outline-none"
                style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}
              />
              <input
                type="email"
                placeholder="Your email address *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-white outline-none"
                style={{ background: '#1A1A2E', borderColor: '#2A2A3E' }}
                onKeyDown={e => e.key === 'Enter' && generateReport()}
              />
              <button
                onClick={generateReport}
                disabled={!email.trim() || isAnalyzing}
                className="w-full py-3 rounded-xl font-bold transition-all"
                style={{
                  background: email.trim() && !isAnalyzing ? '#D4A847' : '#2A2A3E',
                  color: email.trim() && !isAnalyzing ? '#0A0A0F' : '#64748B',
                }}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#64748B', borderTopColor: 'transparent' }} />
                    Generating your report…
                  </span>
                ) : 'Generate My Report →'}
              </button>
              <p className="text-xs text-center" style={{ color: '#475569' }}>Report will also be emailed to you. No spam.</p>
            </div>
          </div>
        ) : (
          // Chat interface
          <div className="flex-1 flex flex-col gap-4">
            {/* Messages */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1" style={{ background: '#D4A847', color: '#0A0A0F' }}>
                      S
                    </div>
                  )}
                  <div
                    className="max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed prose-chat"
                    style={{
                      background: msg.role === 'user' ? '#1E3A5F' : '#1A1A2E',
                      color: msg.role === 'user' ? '#E2E8F0' : '#CBD5E1',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    }}
                  >
                    {msg.content || (isStreaming && i === messages.length - 1 ? (
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4A847', animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4A847', animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4A847', animationDelay: '300ms' }} />
                      </span>
                    ) : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response…"
                rows={1}
                disabled={isStreaming}
                className="flex-1 px-4 py-3 rounded-xl border text-white text-sm outline-none resize-none"
                style={{
                  background: '#1A1A2E',
                  borderColor: '#2A2A3E',
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="px-4 py-3 rounded-xl font-semibold text-sm transition-all flex-shrink-0"
                style={{
                  background: input.trim() && !isStreaming ? '#D4A847' : '#1A1A2E',
                  color: input.trim() && !isStreaming ? '#0A0A0F' : '#475569',
                }}
              >
                Send
              </button>
            </div>
            <p className="text-xs text-center" style={{ color: '#2A2A3E' }}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        )}
      </div>
    </div>
  );
}
