import { serve } from 'inngest/next';
import { inngest } from '@/jobs/inngest/client';
import { inngestFunctions } from '@/jobs/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
