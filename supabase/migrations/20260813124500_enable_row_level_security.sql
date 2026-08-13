alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.bankroll_accounts enable row level security;
alter table public.bankroll_transactions enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create policy "tournaments_select_own"
  on public.tournaments for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "tournaments_insert_own"
  on public.tournaments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "tournaments_update_own"
  on public.tournaments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tournaments_delete_own"
  on public.tournaments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "bankroll_accounts_select_own"
  on public.bankroll_accounts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "bankroll_accounts_insert_own"
  on public.bankroll_accounts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "bankroll_accounts_update_own"
  on public.bankroll_accounts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "bankroll_accounts_delete_own"
  on public.bankroll_accounts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "bankroll_transactions_select_own"
  on public.bankroll_transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "bankroll_transactions_insert_own"
  on public.bankroll_transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "bankroll_transactions_update_own"
  on public.bankroll_transactions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "bankroll_transactions_delete_own"
  on public.bankroll_transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
