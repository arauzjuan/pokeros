-- Table privileges are required before PostgreSQL evaluates Row Level Security.
-- RLS policies continue to restrict every operation to rows owned by auth.uid().
grant select, insert, update, delete on table
  public.profiles,
  public.tournaments,
  public.bankroll_accounts,
  public.bankroll_transactions
to authenticated;
