import { describe, it, expect } from 'vitest';
import { routeAIModel } from '@/lib/ai/route-model';

describe('routeAIModel', () => {
  it('all plans and task types use gemini-2.0-flash', () => {
    expect(routeAIModel('starter', 'advanced')).toBe('gemini-2.0-flash');
    expect(routeAIModel('growth', 'advanced')).toBe('gemini-2.0-flash');
    expect(routeAIModel('growth', 'basic')).toBe('gemini-2.0-flash');
    expect(routeAIModel('pro', 'basic')).toBe('gemini-2.0-flash');
  });
});

