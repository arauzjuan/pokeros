# PokerOS

PokerOS is a Next.js application for tracking poker tournaments, bankroll movements, and player performance.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL via Supabase
- Vercel

## Requirements

- Node.js 20.9 or newer
- pnpm

## Local setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

4. Replace the placeholder values in `.env.local` with your Supabase project credentials.
5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Available commands

- `pnpm dev`: start the development server.
- `pnpm build`: create a production build.
- `pnpm start`: run the production build.
- `pnpm lint`: run ESLint.

## Project structure

- `app/`: routes and layouts.
- `components/`: reusable UI components.
- `lib/`: shared utilities.
- `services/`: application and integration services.
- `types/`: shared TypeScript types.
- `public/`: static assets.

## Environment variables

Never commit real credentials. Keep secrets in `.env.local` locally and in Vercel environment variables for deployments. `.env.example` contains placeholders only.
