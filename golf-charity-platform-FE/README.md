# GolfGives — Golf. Draw. Impact.

A subscription-based golf charity platform where players log Stableford scores, enter monthly prize draws, and fund their chosen charities — all in one place.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | TanStack Router v1 (code-based) |
| Server State | TanStack Query v5 |
| Client State | Redux Toolkit (auth slice) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Supabase (Auth + DB + Storage) |
| Payments | Stripe (Checkout + Billing Portal + Webhooks) |
| Fonts | Plus Jakarta Sans + DM Serif Display |

---

## Features

- **Auth** — Email/password + Google OAuth on both Login and Register pages
- **Subscriptions** — Monthly/yearly Stripe Checkout, billing portal, webhook lifecycle
- **Score Tracking** — Rolling 5 Stableford scores (1–45), oldest auto-deleted on 6th entry
- **Prize Draws** — 40/35/25% prize tier split, pool calc, rollover, simulate & publish
- **Draw Numbers** — Each user's 5 scores become their lottery ticket numbers
- **Charity** — Choose a charity + set contribution % (10–50%), saved to profile
- **Winner Verification** — Winners upload proof; admin verifies
- **Admin Panel** — KPI overview, users list, draw control (random + algorithmic), charity CMS, winner verification

---

## Routes

```
/                     Landing page
/login                Sign in
/register             Create account
/subscription/success Post-checkout success

/dashboard            User home
/dashboard/scores     Log & view scores
/dashboard/charity    Choose charity + contribution %
/dashboard/draw       Draw numbers + prize info + proof upload
/dashboard/settings   Account settings

/admin                Admin overview (KPIs)
/admin/users          Users list
/admin/draws          Draw control
/admin/charities      Charity CMS
/admin/winners        Winner verification
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

Output is in `dist/`.

---

## Supabase Edge Functions

All functions deployed with `--no-verify-jwt`:

| Function | Purpose |
|---|---|
| `create-checkout-session` | Stripe Checkout |
| `create-portal-session` | Stripe Billing Portal |
| `stripe-webhook` | Subscription lifecycle events |

---

## Deployment

Both `vercel.json` and `netlify.toml` are included for SPA routing rewrites.

Set these environment variables in your deployment dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
