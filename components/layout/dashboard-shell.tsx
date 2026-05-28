'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { WorkspaceSwitcher } from './workspace-switcher';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useWorkspaceStore, type Workspace } from '@/stores/workspace-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTransition } from './page-transition';
import { createClient } from '@/lib/supabase/client';
import { playChime } from '@/lib/sound';
import {
  Search,
  Sparkles,
  Plus,
  Command,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Users,
  Settings,
  BrainCircuit,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardShellProps {
  user: User;
  initialWorkspaces: Workspace[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  initialWorkspaces,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setWorkspaces, setActiveWorkspace, activeWorkspaceId } = useWorkspaceStore();

  // UX states
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Command palette search
  const [cmdSearch, setCmdSearch] = useState('');

  // AI chat states
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant' | 'system'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hello! I am your Vyron AI Copilot. I can analyze your transactions, summarize cashflow, predict expenses, or help with tax calculations. Ask me anything!`,
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load sound settings
  useEffect(() => {
    const savedSound = localStorage.getItem('vyron_sound_enabled');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('vyron_sound_enabled', String(nextVal));
    if (nextVal) {
      playChime('success');
    }
  };

  // Sound triggering proxy
  const triggerChime = (type: 'success' | 'warning' | 'info' | 'delete') => {
    if (soundEnabled) {
      playChime(type);
    }
  };

  useEffect(() => {
    setWorkspaces(initialWorkspaces);
    if (initialWorkspaces[0] && !activeWorkspaceId) {
      setActiveWorkspace(initialWorkspaces[0].id);
    }
  }, [initialWorkspaces, setWorkspaces, setActiveWorkspace, activeWorkspaceId]);

  // Scroll AI chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiLoading]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmdPalette((prev) => !prev);
        triggerChime('info');
      }

      // Esc -> Close Modals/Drawers
      if (e.key === 'Escape') {
        setShowCmdPalette(false);
        setShowAiPanel(false);
        setShowFabMenu(false);
      }

      // N (when not typing in form input) -> New Transaction Quick Navigation
      if (
        e.key === 'n' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        router.push('/transactions?action=new');
        triggerChime('info');
      }

      // I -> New Invoice Quick Navigation
      if (
        e.key === 'i' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        router.push('/invoices?action=new');
        triggerChime('info');
      }

      // / -> Focus Search
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        const searchInput = document.getElementById('ledger-search') || document.getElementById('search-input');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, soundEnabled]);

  const initials =
    user.user_metadata?.full_name?.slice(0, 2)?.toUpperCase() ??
    user.email?.slice(0, 2)?.toUpperCase() ??
    'VY';

  const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

  // AI Chat submission
  const handleSendAiMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const textToSend = customPrompt || aiInput;
    if (!textToSend.trim() || aiLoading) return;

    setAiInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, content: textToSend }];
    setChatMessages(newMessages);
    setAiLoading(true);

    try {
      // Gather transaction summaries to attach as context for financial answers
      const supabase = createClient();
      const { data: txs } = await supabase
        .from('transactions')
        .select('type, amount_inr, category, description, transaction_date')
        .eq('business_id', activeWorkspaceId || '')
        .eq('deleted_at', null)
        .limit(30);

      const contextString = txs && txs.length > 0 
        ? `Here is the business's recent transaction history for context: ${JSON.stringify(txs)}`
        : `There are no transactions recorded in this business ledger yet.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are the Vyron AI financial analyst. Answer the user's questions about their financial dashboard. ${contextString}` },
            ...newMessages
          ],
          taskType: 'copilot',
        }),
      });

      const resData = await response.json();
      setAiLoading(false);

      if (response.ok) {
        const text = resData.text || resData.content;
        setChatMessages((prev) => [...prev, { role: 'assistant', content: text }]);
        triggerChime('success');
      } else {
        throw new Error();
      }
    } catch {
      setAiLoading(false);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an issue analyzing your ledger. Please try again shortly.` },
      ]);
      triggerChime('warning');
    }
  };

  // Quick navigation items for palette
  const COMMAND_ITEMS = [
    { label: 'Go to Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Go to Transactions Ledger', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Go to Invoices & Bills', href: '/invoices', icon: FileText },
    { label: 'Go to Leads CRM', href: '/leads', icon: Users },
    { label: 'Create New Transaction (N)', href: '/transactions?action=new', icon: Plus },
    { label: 'Create GST Invoice (I)', href: '/invoices?action=new', icon: Plus },
    { label: 'App Settings', href: '/settings', icon: Settings },
  ];

  const filteredCommands = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans select-none">
      {/* Dynamic Aurora Moving Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-violet-600/30 blur-[150px] animate-aurora-slow" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-cyan-600/20 blur-[150px] animate-aurora-slow" style={{ animationDelay: '-6s' }} />
      </div>

      <div className="relative z-10 flex">
        <Sidebar className="hidden lg:flex" />
        
        <main className="min-h-screen flex-1 pb-20 lg:pb-0 flex flex-col relative">
          {/* Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <WorkspaceSwitcher />
              
              {/* CMD Palette Trigger */}
              <button
                onClick={() => {
                  setShowCmdPalette(true);
                  triggerChime('info');
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-foreground text-xs transition-all shadow-inner cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search dashboard...</span>
                <span className="flex items-center gap-0.5 rounded border border-white/10 px-1 text-[10px] font-mono font-bold bg-black/40">
                  <Command className="h-2.5 w-2.5" />K
                </span>
              </button>

              {isDevMode && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[9px] font-extrabold text-red-400 tracking-wider font-mono animate-pulse">
                  DEV MODE ACTIVE
                </span>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Sound toggle button */}
              <button
                onClick={toggleSound}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition-all shadow-md"
                title={soundEnabled ? 'Mute micro-interaction sounds' : 'Unmute micro-interaction sounds'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Collapsible Copilot toggle */}
              <button
                onClick={() => {
                  setShowAiPanel(!showAiPanel);
                  triggerChime('info');
                }}
                className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border transition-all shadow-md ${
                  showAiPanel 
                    ? 'border-violet-500/40 bg-violet-500/20 text-violet-400' 
                    : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
                title="AI Business Copilot Sidepanel"
              >
                <BrainCircuit className="h-4 w-4" />
              </button>

              <NotificationBell />
              
              <Link href="/settings">
                <Avatar className="h-9 w-9 border border-white/15 hover:border-white/30 transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-zinc-900 text-white font-extrabold">{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          {/* Animated Page transitions */}
          <div className="p-4 lg:p-8 flex-1">
            <PageTransition key={pathname}>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile-first bottom navigation drawer bar */}
      <MobileNav className="lg:hidden" />

      {/* Enterprise Centralized Keyboard shortcuts & FAB menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        <AnimatePresence>
          {showFabMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="flex flex-col gap-2.5 mb-2 bg-zinc-950/90 border border-white/10 p-3 rounded-2xl backdrop-blur-xl shadow-2xl items-end text-xs"
            >
              {[
                { label: 'Add Transaction', href: '/transactions?action=new', color: 'from-cyan-500 to-blue-500' },
                { label: 'Create GST Invoice', href: '/invoices?action=new', color: 'from-violet-500 to-fuchsia-500' },
                { label: 'Add Pipeline Lead', href: '/leads?action=new', color: 'from-amber-500 to-orange-500' },
                { label: 'Quick Settings', href: '/settings', color: 'from-zinc-600 to-zinc-800' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setShowFabMenu(false);
                    router.push(item.href);
                    triggerChime('info');
                  }}
                  className={`bg-gradient-to-r ${item.color} text-white font-bold h-8.5 px-3.5 rounded-xl transition-transform hover:scale-105 shadow-md flex items-center gap-1.5`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setShowFabMenu(!showFabMenu);
            triggerChime('info');
          }}
          className={`flex h-12.5 w-12.5 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-xl font-bold cursor-pointer ${
            showFabMenu ? 'rotate-45 bg-zinc-800 text-white' : ''
          }`}
        >
          <Plus className="h-6 w-6 transition-transform" />
        </button>
      </div>

      {/* Global Collapsible right-hand AI Side Panel */}
      <AnimatePresence>
        {showAiPanel && (
          <>
            {/* Backdrop click-out */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowAiPanel(false)} />
            
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md border-l border-white/10 bg-zinc-950/95 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-violet-400 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Vyron AI Copilot</h3>
                    <p className="text-[10px] text-zinc-500">Real-time ledger financial intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAiPanel(false);
                    triggerChime('info');
                  }}
                  className="rounded-lg p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        msg.role === 'user'
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      }`}
                    >
                      {msg.role === 'user' ? 'ME' : 'AI'}
                    </div>
                    <div
                      className={`p-3 rounded-2xl border ${
                        msg.role === 'user'
                          ? 'bg-zinc-900 border-white/5 text-zinc-200'
                          : 'bg-white/5 border-white/10 text-zinc-300'
                      } leading-relaxed`}
                    >
                      <p className="whitespace-pre-wrap leading-normal text-[11px]">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="h-7.5 w-7.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold">
                      AI
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick AI Prompt triggers */}
              <div className="border-t border-white/5 pt-3 mb-2 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Instant Analysis</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    'Explain this month\'s cashflow',
                    'GST liability summary',
                    'Predict expenses trend',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      disabled={aiLoading}
                      onClick={() => handleSendAiMessage(undefined, prompt)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-[10.5px] border border-white/5 px-2.5 py-1 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer truncate max-w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAiMessage} className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask Vyron AI about expenses, GST..."
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600 h-9"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="bg-white text-black hover:bg-zinc-200 h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Palette (Ctrl + K) Modal */}
      <AnimatePresence>
        {showCmdPalette && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl p-4 space-y-4"
            >
              {/* Search bar inside palette */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  autoFocus
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  placeholder="Type a command or page to navigate..."
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-9 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={() => setShowCmdPalette(false)}
                  className="absolute right-3 text-[10px] text-zinc-500 hover:text-white flex items-center gap-0.5 rounded border border-white/15 px-1 bg-black/40"
                >
                  ESC
                </button>
              </div>

              {/* Commands List */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.label}
                        onClick={() => {
                          setShowCmdPalette(false);
                          router.push(cmd.href);
                          triggerChime('info');
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                      >
                        <div className="h-7 w-7 rounded-lg border border-white/5 bg-zinc-900 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 group-hover:text-cyan-400 transition-all">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{cmd.label}</span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-zinc-600 text-xs text-center py-6">No commands found for "{cmdSearch}"</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
