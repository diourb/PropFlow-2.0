# PropFlow 2.0

PropFlow is a Next.js App Router SaaS application for short-term rental and property operations. The MVP supports workspace setup, role-based portals, properties, bookings, cleaning tasks, maintenance work orders, owners, guests, reports, notifications, settings, and provider-gated integrations.

## Current Status

- Next.js 16 App Router application with protected app routes, public marketing/auth routes, and demo/local fallback mode.
- Demo mode works without Supabase or provider credentials and keeps operational workflows usable for local QA.
- Supabase is the intended production data layer. Server actions and repository helpers keep mutations scoped through the app data layer.
- PayPal subscription routes exist. Stripe is not wired in this repo.
- Resend, Twilio, Web Push, Google Calendar, Airbnb, VRBO, and QuickBooks integrations are credential-gated and must not be treated as active until env vars and backend flows are configured.
- A launch-readiness RLS hardening migration is included, but it still needs to be applied and verified against the live Supabase project before production use.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

When Supabase env vars are missing, the app runs in demo mode. Demo mode is useful for QA and sales walkthroughs, but it is not a production persistence layer.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Playwright starts the dev server automatically for E2E tests.

Current local validation notes:

- `npm install` completed successfully.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.
- `npm install` reports 2 moderate npm audit findings. Review them intentionally; do not run a forced audit fix without checking package impact.

## Environment Variables

Copy `.env.example` to `.env.local` and configure the values needed for your environment.

Required for Supabase-backed production data:

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

PayPal subscriptions:

```bash
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_PLAN_ID_STARTER=
PAYPAL_PLAN_ID_PROFESSIONAL=
PAYPAL_PLAN_ID_ENTERPRISE=
```

Messaging and notifications:

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Channel and accounting integrations:

```bash
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
AIRBNB_CLIENT_ID=
AIRBNB_CLIENT_SECRET=
VRBO_CLIENT_ID=
VRBO_CLIENT_SECRET=
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
```

Never expose service-role, PayPal secret, Resend, Twilio, or private VAPID credentials in frontend code.

## Supabase Setup Notes

1. Create or select a Supabase project.
2. Add the public URL and publishable key to `.env.local`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` only to trusted server environments.
4. Apply migrations in `supabase/migrations`.
5. Confirm every customer-data table is scoped by `workspace_id` where applicable.
6. Verify RLS policies with real users across workspace admin, manager, owner, cleaner, maintenance, and suspended roles.
7. Keep private operational files in private storage buckets and serve them with signed URLs.

The app is designed to avoid crashing when Supabase env vars are absent, but production usage requires Supabase configuration and RLS verification.

## Billing And Provider Status

PropFlow currently includes PayPal subscription plumbing. Live checkout requires Supabase, PayPal REST app credentials, a PayPal webhook ID, and configured PayPal plan IDs. Stripe is not integrated in this codebase; Stripe CTAs should remain provider-not-configured until a dedicated Stripe implementation is added.

Email, SMS, WhatsApp, push, calendar, channel, and accounting integrations must only claim real sends/syncs when their provider credentials and backend handlers are configured. Missing providers should show configured/not-configured states instead of pretending work was completed.

## Deployment

Vercel deployment flow:

1. Import the PropFlow repository into Vercel.
2. Set the environment variables above for the target environment.
3. Build with `npm run build`.
4. Configure Supabase auth redirect URLs to include the deployed domain.
5. Configure PayPal webhook URLs if subscriptions are enabled.
6. Re-run smoke tests against the deployed preview before promoting to production.

## Known Limitations

- Demo/local mode is intentionally not a production database.
- Supabase RLS hardening has been added, but live database advisor checks and user-level policy tests are still required.
- Stripe is not wired; the repo currently uses PayPal.
- File/photo upload controls are local previews or setup-required states until private Supabase Storage flows are completed.
- Provider-backed email, SMS, WhatsApp, push, calendar, channel, and accounting syncs require credentials and production webhook verification.
- Frontend role checks improve MVP UX, but backend authorization and RLS remain the production enforcement layer.

## Recommended Next Production Tasks

- Apply migrations to a staging Supabase project and run RLS tests with seeded users for each role.
- Complete private Supabase Storage upload/download flows for property photos, cleaning photos, repair photos, documents, receipts, and invoices.
- Add production billing webhook tests for PayPal, or implement Stripe in a separate provider-focused PR.
- Add CI for lint, typecheck, build, and Playwright.
- Resolve npm audit findings after reviewing dependency impact.
