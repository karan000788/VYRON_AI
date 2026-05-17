import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAIRequest, AIQuotaError } from '@/lib/ai/quota';
import { cookies } from 'next/headers';
import { z } from 'zod';

const schema = z.object({
  message: z.string().min(1).max(8000),
  taskType: z.enum(['basic', 'advanced', 'workflow']).default('basic'),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const businessId = cookieStore.get('vyron_workspace')?.value;
  if (!businessId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { message, taskType, sessionId } = parsed.data;

  try {
    const result = await runAIRequest({
      businessId,
      userId: user.id,
      taskType,
      messages: [
        {
          role: 'system',
          content:
            'You are VYRON AI, a business assistant for Indian SMBs. Be concise and actionable.',
        },
        { role: 'user', content: message },
      ],
    });

    if (sessionId) {
      await supabase.from('ai_memories').insert([
        {
          business_id: businessId,
          session_id: sessionId,
          role: 'user',
          content: message,
          created_by: user.id,
        },
        {
          business_id: businessId,
          session_id: sessionId,
          role: 'assistant',
          content: result.content,
          created_by: user.id,
        },
      ]);
    }

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AIQuotaError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 429 });
    }
    console.error('AI Request Error:', e);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
