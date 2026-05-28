'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Plus, Send, Settings, Sparkles, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

const SUGGESTED_PROMPTS = [
  { title: 'Build a SaaS landing page', icon: Sparkles },
  { title: 'Explain JWT authentication', icon: MessageSquare },
  { title: 'Generate React dashboard', icon: Bot },
  { title: 'Fix this TypeScript error', icon: Settings },
];

export default function CopilotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vyron_copilot_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0 && !currentSessionId) {
        loadSession(parsed[0].id);
      } else if (parsed.length === 0) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('vyron_copilot_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const createNewSession = () => {
    const id = Date.now().toString();
    const newSession = { id, title: 'New Conversation', updatedAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
    setMessages([]);
  };

  const loadSession = (id: string) => {
    setCurrentSessionId(id);
    const savedMessages = localStorage.getItem(`vyron_copilot_messages_${id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([]);
    }
  };

  // Save messages for current session
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      localStorage.setItem(`vyron_copilot_messages_${currentSessionId}`, JSON.stringify(messages));
    }
  }, [messages, currentSessionId]);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.removeItem(`vyron_copilot_messages_${id}`);
    
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        loadSession(newSessions[0].id);
      } else {
        createNewSession();
      }
    }
    if (newSessions.length === 0) {
      localStorage.removeItem('vyron_copilot_sessions');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const submitMessage = async (contentStr: string) => {
    if (!contentStr.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentStr.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Auto-update session title if it's the first message
    if (sessions.find(s => s.id === currentSessionId)?.title === 'New Conversation') {
      const title = userMessage.content.length > 30 ? userMessage.content.substring(0, 30) + '...' : userMessage.content;
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title, updatedAt: Date.now() } : s));
    }

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
        };
        setMessages([...updatedMessages, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat request aborted');
      } else {
        console.error('Chat error:', err);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Error**: ${err.message || 'Unable to connect to the server.'} Please try again later.`,
        };
        setMessages([...updatedMessages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    await submitMessage(input);
  };

  const handlePromptClick = async (prompt: string) => {
    await submitMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(e as any);
      }
    }
  };


  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-black/40">
      {/* Sidebar */}
      <div className="hidden w-72 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl md:flex">
        <div className="p-4">
          <Button onClick={createNewSession} className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  currentSessionId === session.id 
                    ? 'bg-vyron-cyan/10 text-vyron-cyan border border-vyron-cyan/20' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        <div className="absolute inset-0 bg-vyron-gradient opacity-5 pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <div className="mx-auto max-w-4xl space-y-8 pb-20">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center pt-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-vyron-cyan/20 to-vyron-purple/20 shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)] ring-1 ring-white/10 backdrop-blur-xl"
                >
                  <Sparkles className="h-10 w-10 text-vyron-cyan" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-2 text-2xl font-bold text-white sm:text-3xl"
                >
                  How can I help you today?
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12 text-center text-zinc-400 max-w-md"
                >
                  I'm your VYRON AI Copilot. I can write code, brainstorm ideas, analyze data, and help you navigate the dashboard.
                </motion.p>
                
                <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={prompt.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => handlePromptClick(prompt.title)}
                      className="group flex flex-col items-start justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-vyron-cyan/30 hover:bg-white/10 hover:shadow-lg hover:shadow-vyron-cyan/5 backdrop-blur-sm"
                    >
                      <prompt.icon className="h-5 w-5 text-zinc-400 group-hover:text-vyron-cyan transition-colors" />
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{prompt.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message: any) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] gap-4 sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {message.role === 'user' ? (
                            <Avatar className="h-8 w-8 ring-1 ring-white/10 shadow-lg">
                              <AvatarFallback className="bg-zinc-800 text-xs">US</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vyron-cyan to-vyron-purple shadow-lg ring-1 ring-white/20">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-5 py-4 shadow-sm backdrop-blur-md ${
                            message.role === 'user'
                              ? 'bg-zinc-800/80 text-white rounded-tr-sm border border-white/5'
                              : 'bg-black/50 text-zinc-200 rounded-tl-sm border border-white/10 shadow-xl'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap text-[15px]">{message.content}</div>
                          ) : (
                            <Markdown content={message.content} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex max-w-[75%] gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vyron-cyan to-vyron-purple ring-1 ring-white/20">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center rounded-2xl rounded-tl-sm border border-white/10 bg-black/50 px-5 py-4">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-4 px-4 sm:px-8">
          <div className="mx-auto max-w-4xl relative">
            <form id="chat-form" onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-vyron-cyan/50 focus-within:ring-1 focus-within:ring-vyron-cyan/50">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask VYRON Copilot anything..."
                className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-[15px] text-white placeholder-zinc-500 outline-none"
                rows={1}
              />
              <div className="flex h-[44px] items-center justify-center px-2">
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    onClick={stop}
                    className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                  >
                    <div className="h-3 w-3 rounded-sm bg-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim()}
                    className={`h-8 w-8 rounded-full transition-all ${
                      input.trim() 
                        ? 'bg-vyron-cyan text-black hover:bg-vyron-cyan/90 hover:scale-105' 
                        : 'bg-white/10 text-zinc-500'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
            <div className="mt-2 text-center text-xs text-zinc-500">
              VYRON AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
