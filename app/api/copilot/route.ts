import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    // Filter out system messages to avoid security risk warning
    const cleanMessages = Array.isArray(messages) 
      ? messages.filter((m: any) => m.role !== 'system')
      : [];

    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages: cleanMessages,
      system: `You are VYRON AI Copilot, an advanced and intelligent AI assistant built into the VYRON AI SaaS dashboard.
You help the user with coding, explanations, brainstorming, debugging, content generation, and using the platform.
Be concise, professional, and helpful. Use markdown for formatting, especially for code blocks.
You can help the user generate landing pages, write React/Next.js code, fix TypeScript errors, explain JWT auth, and much more.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Copilot API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

