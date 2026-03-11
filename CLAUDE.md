# Trading Journal — Project Notes

## Tech Stack
- Next.js 15 App Router
- TypeScript
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- Tailwind CSS + shadcn/ui components (written manually in `components/ui/`)
- react-hook-form + zod
- recharts (equity curve chart)
- date-fns
- sonner (toasts)
- lucide-react (icons)

## Routing Notes
- `middleware.ts` is the standard Next.js middleware file (NOT `proxy.ts`)
- Protected routes: `/dashboard`, `/trades` — redirect to `/login` if no session
- Auth routes: `/login`, `/signup` — redirect to `/dashboard` if already logged in
- Auth callback: `/auth/callback` — handles Supabase OAuth and magic link redirects

## Supabase Setup
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Copy `.env.local.example` to `.env.local` and fill in your values
- Tables: `profiles`, `trades`
- Storage bucket: `charts` (public bucket for chart screenshots)
- RLS is enabled on all tables

## Database
Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor to create:
- `profiles` table with auto-create trigger on `auth.users` insert
- `trades` table with all fields
- RLS policies for both tables
- Indexes on `trades(user_id)`, `trades(trade_date)`, `trades(ticker)`, `trades(follow_rule)`
- Storage bucket and policy for chart screenshots

## Regenerate Supabase Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

## Development
```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Key Files
- `actions/tradeActions.ts` — all server actions (CRUD + file upload)
- `components/TradeForm.tsx` — 4-tab form (Trade Details, Entry/Exit, Context/Plan, Psychology)
- `components/TradeTable.tsx` — sortable, filterable trade list
- `components/EquityCurve.tsx` — cumulative P/L chart
- `components/StatsCards.tsx` — dashboard stat cards
- `components/RuleAdherenceBar.tsx` — stacked bar for Yes/No/Partially follow_rule
- `lib/utils.ts` — utility functions for stats calculations
