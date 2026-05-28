'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles, Bot, User, Copy, RotateCw, Volume2, VolumeX, Mic } from 'lucide-react';

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
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
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

    const assistantContent = data.text || data.content || '';
    setMessages((m) => [...m, { role: 'assistant', content: assistantContent }]);
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  async function handleRegenerate(assistantIndex: number) {
    if (loading) return;
    const userMessageIndex = assistantIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex]?.role !== 'user') return;
    
    const truncatedMessages = messages.slice(0, assistantIndex);
    setMessages(truncatedMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: truncatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
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

      const assistantContent = data.text || data.content || '';
      setMessages((m) => [...m, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setLoading(false);
      toast.error('Failed to regenerate response');
    }
  }

  const handleSpeak = (text: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (currentlySpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Remove markdown symbols and link text for a clean, natural speaking voice
    const cleanText = text
      .replace(/[\*\#\`\_]/g, '')
      .replace(/\[.*\]\(.*\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      setCurrentlySpeakingIndex(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingIndex(null);
    };

    setCurrentlySpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice Speech Recognition is not supported by your current browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      toast.info('Voice Capture Active. Speak your business prompt now...');
    };

    rec.onresult = (event: any) => {
      const textCaptured = event.results[0][0].transcript;
      setInput(textCaptured);
      toast.success('Voice commands captured successfully!');
    };

    rec.onerror = () => {
      toast.error('Could not capture voice input. Please try again.');
    };

    rec.start();
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <Sparkles className="mb-4 h-12 w-12 text-violet-400 animate-pulse" />
            <p className="text-xs">Ask about your business, finances, or growth strategies.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex w-full gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vyron-cyan to-vyron-purple ring-1 ring-white/20 shadow-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5 max-w-[75%]">
              <div
                className={`rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-violet-600/30 text-white rounded-tr-sm border border-violet-500/10'
                    : 'bg-white/10 text-zinc-200 rounded-tl-sm border border-white/5 font-mono'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-3 px-1 text-[10px] text-zinc-500">
                  <button
                    onClick={() => handleCopy(m.content)}
                    className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => handleRegenerate(i)}
                    className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                  >
                    <RotateCw className="h-3 w-3" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={() => handleSpeak(m.content, i)}
                    className={`flex items-center gap-1 transition-colors ${
                      currentlySpeakingIndex === i 
                        ? 'text-cyan-400 hover:text-cyan-300' 
                        : 'hover:text-zinc-300'
                    }`}
                  >
                    {currentlySpeakingIndex === i ? (
                      <>
                        <VolumeX className="h-3 w-3" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10 shadow-lg">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex w-full gap-3 justify-start">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vyron-cyan to-vyron-purple ring-1 ring-white/20 shadow-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="max-w-[75%] rounded-lg bg-white/10 px-4 py-3 text-sm rounded-tl-sm border border-white/5">
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-white/10 p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VYRON AI…"
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
          className="bg-zinc-900 border-white/10 text-xs h-9"
        />
        <Button
          type="button"
          onClick={startVoiceInput}
          variant="outline"
          className="border-white/10 bg-zinc-900 text-zinc-400 hover:text-white h-9 w-9 p-0 flex items-center justify-center rounded-xl"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button onClick={send} disabled={loading} className="bg-white text-black hover:bg-zinc-200 text-xs font-bold px-4 h-9 rounded-xl">
          {loading ? '…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
