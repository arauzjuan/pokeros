create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  default_currency text not null default 'USD'
    check (default_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  venue text,
  format text not null default 'live'
    check (format in ('live', 'online')),
  status text not null default 'planned'
    check (status in ('planned', 'registered', 'completed', 'cancelled')),
  starts_at timestamptz not null,
  ended_at timestamptz,
  buy_in numeric(14, 2) not null default 0 check (buy_in >= 0),
  fee numeric(14, 2) not null default 0 check (fee >= 0),
  reentries numeric(5, 0) not null default 0 check (reentries >= 0),
  prize numeric(14, 2) not null default 0 check (prize >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= starts_at),
  unique (id, user_id)
);

create table public.bankroll_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  account_type text not null default 'cash'
    check (account_type in ('cash', 'bank', 'wallet', 'poker_site', 'other')),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  opening_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

create table public.bankroll_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid not null,
  tournament_id uuid,
  transaction_type text not null
    check (transaction_type in ('deposit', 'withdrawal', 'buy_in', 'prize', 'fee', 'adjustment')),
  amount numeric(14, 2) not null check (amount <> 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  occurred_at timestamptz not null default now(),
  description text,
  created_at timestamptz not null default now(),
  foreign key (account_id, user_id)
    references public.bankroll_accounts (id, user_id) on delete cascade,
  foreign key (tournament_id, user_id)
    references public.tournaments (id, user_id) on delete restrict
);

create index tournaments_user_starts_at_idx
  on public.tournaments (user_id, starts_at desc);
create index tournaments_user_status_idx
  on public.tournaments (user_id, status);
create index bankroll_accounts_user_active_idx
  on public.bankroll_accounts (user_id, is_active);
create index bankroll_transactions_user_occurred_at_idx
  on public.bankroll_transactions (user_id, occurred_at desc);
create index bankroll_transactions_account_occurred_at_idx
  on public.bankroll_transactions (account_id, occurred_at desc);
create index bankroll_transactions_tournament_idx
  on public.bankroll_transactions (tournament_id)
  where tournament_id is not null;

comment on column public.bankroll_transactions.amount is
  'Signed amount: positive values add funds and negative values remove funds.';
