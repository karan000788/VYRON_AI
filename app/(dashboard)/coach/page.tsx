'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles, Bot, User, Mic, MicOff, Send, HelpCircle, AlertCircle, Copy, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VOICE_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
];

const PRESETS = [
  { text: 'Analyze my profit margins and suggest improvements.', label: 'Analyze Profit Margin' },
  { text: 'Draft an Indian festival ad campaign structure.', label: 'Festival Ad Structure' },
  { text: 'Recommend pricing strategies for an IT services startup.', label: 'IT Pricing Strategy' },
];

export default function BusinessCoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSpeak = (text: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech not supported.');
      return;
    }

    if (currentlySpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\*\#\`\_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setCurrentlySpeakingIndex(null);
    utterance.onerror = () => setCurrentlySpeakingIndex(null);
    setCurrentlySpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handlePreset = (presetText: string) => {
    setInput(presetText);
  };

  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice input (Speech-to-Text) is not supported in this browser version.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
      setIsListening(false);
      toast.success('Speech recognized successfully!');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed. Speak clearly into your microphone.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;
    const userPrompt = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userPrompt }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          taskType: 'coach',
        }),
      });

      setLoading(false);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Coach consultation request failed.');
        return;
      }

      setMessages((m) => [...m, { role: 'assistant', content: data.text || data.content }]);
    } catch (err) {
      setLoading(false);
      toast.error('Unable to establish connection with AI consultant.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          AI Business Coach
        </h1>
        <p className="text-xs text-zinc-500">
          Analyze pricing, suggest sales scripts, and optimize profitability with your elite virtual consultant.
        </p>
      </div>

      <FeatureGateShield feature="business_coach" requiredPlan="Pro">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Preset Topics Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-violet-400" />
                  Preset Coaching Topics
                </CardTitle>
                <CardDescription className="text-xs">Select a preset to run detailed business audits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePreset(p.text)}
                    className="w-full text-left text-xs p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-zinc-300 leading-relaxed font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-cyan-400" />
                  Consultant Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 leading-relaxed space-y-2">
                <p>
                  As an elite virtual business coach, the AI utilizes financial metrics, pipeline counts, and cashflow ratios to identify leaks and opportunities.
                </p>
                <p className="rounded border border-cyan-500/10 bg-cyan-950/20 p-2.5 text-[10px] text-cyan-300">
                  <strong>Pro Plan Perk:</strong> Access is unlimited with priority GPU prompt scheduling.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Consultation Chat Workspace */}
          <div className="lg:col-span-2">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl flex flex-col h-[600px]">
              {/* Message Display Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 space-y-3">
                    <Sparkles className="h-10 w-10 text-cyan-400 animate-pulse" />
                    <h5 className="text-sm font-bold text-white">Consultant Online</h5>
                    <p className="text-xs max-w-sm">
                      Ask me to audit cashflows, evaluate operational health, or design growth models.
                    </p>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex w-full gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 ring-1 ring-white/20 shadow-lg">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 max-w-[75%]">
                      <div
                        className={`rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-violet-600/30 text-white rounded-tr-sm border border-violet-500/10'
                            : 'bg-white/10 text-zinc-200 rounded-tl-sm border border-white/5 whitespace-pre-wrap'
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 ring-1 ring-white/20 shadow-lg">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="max-w-[75%] rounded-lg bg-white/10 px-4 py-3 text-xs rounded-tl-sm border border-white/5">
                      <div className="flex items-center gap-1.5 px-1 py-0.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Dock */}
              <div className="p-4 border-t border-white/10 flex items-center gap-2">
                {/* Language Select Dropdown */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="rounded-xl border border-white/10 bg-zinc-900 text-[10px] text-zinc-300 px-2 py-1.5 focus:outline-none"
                >
                  {VOICE_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
                  placeholder="Ask the Business Coach or click the mic to speak..."
                  className="flex-1 bg-zinc-900 border-white/10 rounded-xl text-xs h-9"
                />

                <Button
                  onClick={startSpeechRecognition}
                  variant="outline"
                  className={`border-white/10 rounded-xl p-0 h-9 w-9 ${
                    isListening ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button
                  onClick={sendPrompt}
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl h-9 px-4 text-xs font-bold gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </FeatureGateShield>
    </div>
  );
}
