# VYRON AI

**Your AI Workforce & Growth Operating System**

Production-grade multi-tenant AI SaaS for Indian businesses — CRM, finance, GST invoicing, AI copilot, and subscription billing.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind, Shadcn-style UI, Framer Motion, Zustand, SWR
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **AI:** OpenAI (`gpt-4o-mini` / `gpt-4o` with plan-based routing)
- **Payments:** Razorpay subscriptions + webhooks
- **Jobs:** Inngest
- **Email:** Resend · **WhatsApp:** WATI

## Quick start

1. Copy `.env.example` to `.env.local` and fill values.
2. Apply Supabase migrations:

   ```bash
   supabase db push
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
├── app/              # Next.js App Router
├── components/       # UI & feature components
├── lib/              # Supabase, AI, GST, Razorpay, email
├── hooks/            # SWR + workspace hooks
├── stores/           # Zustand workspace store
├── jobs/inngest/     # Background jobs
├── supabase/         # SQL migrations + RLS
├── tests/            # Vitest + Playwright
└── middleware.ts     # Auth + subscription guards
```

## Features

- Multi-tenant workspaces with RBAC
- Subscription state machine (trial → active → grace → suspended)
- AI quota enforcement + abuse detection
- GST invoice calculations (CGST/SGST/IGST)
- DPDP consent, cookie banner, data export/delete
- Inngest: nightly reports, reminders, AI cleanup, billing cron

## Tests

```bash
npm test          # Vitest unit tests
npm run test:e2e  # Playwright E2E
```

## Deploy

Deploy to Vercel and set environment variables. Configure Razorpay webhook to `/api/webhooks/razorpay` and Inngest to `/api/inngest`.
