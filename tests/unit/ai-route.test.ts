import { describe, it, expect } from 'vitest';
import { routeAIModel } from '@/lib/ai/route-model';

describe('routeAIModel', () => {
  it('starter always uses gpt-4o-mini', () => {
    expect(routeAIModel('starter', 'advanced')).toBe('gpt-4o-mini');
  });

  it('growth uses gpt-4o for advanced only', () => {
    expect(routeAIModel('growth', 'advanced')).toBe('gpt-4o');
    expect(routeAIModel('growth', 'basic')).toBe('gpt-4o-mini');
  });

  it('pro uses gpt-4o', () => {
    expect(routeAIModel('pro', 'basic')).toBe('gpt-4o');
  });
});
