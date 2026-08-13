alter table public.bankroll_transactions
  drop constraint bankroll_transactions_transaction_type_check;

update public.bankroll_transactions
set transaction_type = case
  when tournament_id is not null then 'tournament_result'
  when transaction_type = 'deposit' then 'deposit'
  when transaction_type = 'withdrawal' then 'withdrawal'
  else 'adjustment'
end;

-- Historical tournament rows are collapsed into one signed, auditable effect.
with totals as (
  select tournament_id, min(id::text)::uuid as keeper_id, sum(amount) as net_amount
  from public.bankroll_transactions
  where tournament_id is not null
  group by tournament_id
), updated as (
  update public.bankroll_transactions transaction
  set amount = totals.net_amount,
      transaction_type = 'tournament_result',
      description = 'Resultado de torneo'
  from totals
  where transaction.id = totals.keeper_id
  returning transaction.id
)
delete from public.bankroll_transactions transaction
using totals
where transaction.tournament_id = totals.tournament_id
  and transaction.id <> totals.keeper_id;

delete from public.bankroll_transactions
where tournament_id is not null and amount = 0;

insert into public.bankroll_transactions (
  user_id, account_id, transaction_type, amount, currency, occurred_at, description
)
select user_id, id, 'initial', opening_balance, currency, created_at, 'Bankroll inicial'
from public.bankroll_accounts
where opening_balance <> 0
  and not exists (
    select 1 from public.bankroll_transactions transaction
    where transaction.account_id = bankroll_accounts.id
      and transaction.transaction_type = 'initial'
  );

alter table public.bankroll_transactions
  add constraint bankroll_transactions_transaction_type_check
  check (transaction_type in ('initial', 'tournament_result', 'deposit', 'withdrawal', 'adjustment'));

create unique index bankroll_transactions_initial_account_uidx
  on public.bankroll_transactions (account_id)
  where transaction_type = 'initial';

create unique index bankroll_transactions_tournament_result_uidx
  on public.bankroll_transactions (tournament_id)
  where transaction_type = 'tournament_result';

-- Compatibility for the existing tournament RPCs: their buy-in/prize writes are
-- normalized into one net ledger row. The second write becomes a no-op.
create or replace function public.normalize_tournament_ledger_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_net_profit numeric(14, 2);
begin
  if new.tournament_id is null or new.transaction_type not in ('buy_in', 'prize') then
    return new;
  end if;

  if exists (
    select 1 from public.bankroll_transactions
    where tournament_id = new.tournament_id and transaction_type = 'tournament_result'
  ) then
    return null;
  end if;

  select net_profit into v_net_profit
  from public.tournaments
  where id = new.tournament_id and user_id = new.user_id;

  if v_net_profit is null or v_net_profit = 0 then return null; end if;

  new.transaction_type := 'tournament_result';
  new.amount := v_net_profit;
  new.description := 'Resultado de torneo';
  return new;
end;
$$;

create trigger normalize_tournament_ledger_before_insert
before insert on public.bankroll_transactions
for each row execute function public.normalize_tournament_ledger_insert();

create or replace function public.sync_tournament_ledger(
  p_tournament_id uuid,
  p_account_id uuid,
  p_user_id uuid,
  p_currency text,
  p_occurred_at timestamptz,
  p_name text,
  p_amount numeric
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.bankroll_transactions
  where tournament_id = p_tournament_id and user_id = p_user_id;

  if p_amount <> 0 then
    insert into public.bankroll_transactions (
      user_id, account_id, tournament_id, transaction_type, amount,
      currency, occurred_at, description
    ) values (
      p_user_id, p_account_id, p_tournament_id, 'tournament_result', round(p_amount, 2),
      p_currency, p_occurred_at, 'Resultado: ' || trim(p_name)
    );
  end if;
end;
$$;

revoke all on function public.sync_tournament_ledger(uuid, uuid, uuid, text, timestamptz, text, numeric) from public;

create or replace function public.initialize_bankroll(p_amount numeric, p_currency text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_amount < 0 or p_amount > 999999999999.99 then raise exception 'INVALID_INITIAL_BANKROLL'; end if;
  if p_currency !~ '^[A-Z]{3}$' then raise exception 'INVALID_CURRENCY'; end if;

  insert into public.bankroll_accounts (
    user_id, name, account_type, currency, opening_balance, updated_at
  ) values (
    v_user_id, 'Bankroll principal', 'cash', p_currency, p_amount, now()
  )
  on conflict (user_id, name) do update set
    currency = excluded.currency,
    opening_balance = excluded.opening_balance,
    updated_at = now()
  returning id into v_account_id;

  if p_amount = 0 then
    delete from public.bankroll_transactions
    where account_id = v_account_id and transaction_type = 'initial';
  else
    insert into public.bankroll_transactions (
      user_id, account_id, transaction_type, amount, currency, description
    ) values (
      v_user_id, v_account_id, 'initial', p_amount, p_currency, 'Bankroll inicial'
    )
    on conflict (account_id) where transaction_type = 'initial'
    do update set amount = excluded.amount, currency = excluded.currency;
  end if;

  return v_account_id;
end;
$$;

revoke all on function public.initialize_bankroll(numeric, text) from public;
grant execute on function public.initialize_bankroll(numeric, text) to authenticated;

comment on table public.bankroll_transactions is
  'Auditable bankroll ledger. Current bankroll is the signed sum of its transactions.';
comment on column public.bankroll_transactions.transaction_type is
  'Ledger event: INITIAL, TOURNAMENT_RESULT, DEPOSIT, WITHDRAWAL or ADJUSTMENT.';
