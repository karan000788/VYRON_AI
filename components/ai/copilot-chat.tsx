'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg,
        taskType: 'basic',
        sessionId: sessionId.current,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? 'AI request failed');
      return;
    }

    setMessages((m) => [...m, { role: 'assistant', content: data.content }]);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-white/10 bg-white/5">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <Sparkles className="mb-4 h-12 w-12 text-violet-400" />
            <p>Ask about your business, finances, or growth.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-violet-600/30'
                : 'mr-auto bg-white/10'
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-white/10 p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VYRON AI…"
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <Button onClick={send} disabled={loading}>
          {loading ? '…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
