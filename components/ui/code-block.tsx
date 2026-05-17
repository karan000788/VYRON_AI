'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative my-4 flex flex-col rounded-lg border border-white/10 bg-zinc-950 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-zinc-900/80 px-4 py-1.5 backdrop-blur-md">
        <span className="text-xs font-medium text-zinc-400 lowercase">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs font-medium">{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
          }}
          codeTagProps={{
            style: { fontFamily: 'inherit' }
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
