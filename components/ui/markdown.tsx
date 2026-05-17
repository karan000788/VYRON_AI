'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { memo } from 'react';

export const Markdown = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        className="prose prose-invert prose-zinc max-w-none break-words"
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              return (
                <CodeBlock
                  key={Math.random()}
                  language={match[1]}
                  value={String(children).replace(/\n$/, '')}
                />
              );
            }
            return (
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-vyron-cyan" {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-4 list-outside list-disc pl-5 text-zinc-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-4 list-outside list-decimal pl-5 text-zinc-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="mb-1 leading-relaxed">{children}</li>;
          },
          a({ children, href }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="text-vyron-cyan hover:underline">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                <table className="w-full text-left text-sm text-zinc-300">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="bg-white/5 px-4 py-2 font-semibold text-white">{children}</th>;
          },
          td({ children }) {
            return <td className="border-t border-white/10 px-4 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

Markdown.displayName = 'Markdown';
