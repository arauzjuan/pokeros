create or replace function public.current_bankroll(p_currency text default null)
returns numeric
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_balance numeric(14, 2);
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;

  select coalesce(p_currency, default_currency)
    into v_currency
    from public.profiles
   where id = v_user_id;

  if v_currency is null or v_currency !~ '^[A-Z]{3}$' then
    raise exception 'INVALID_CURRENCY';
  end if;

  select coalesce(sum(bt.amount), 0)::numeric(14, 2)
    into v_balance
    from public.bankroll_accounts ba
    left join public.bankroll_transactions bt
      on bt.account_id = ba.id
     and bt.user_id = ba.user_id
     and bt.currency = ba.currency
   where ba.user_id = v_user_id
     and ba.currency = v_currency
     and ba.is_active;

  return coalesce(v_balance, 0);
end;
$$;

revoke all on function public.current_bankroll(text) from public;
grant execute on function public.current_bankroll(text) to authenticated;

comment on function public.current_bankroll(text) is
  'Returns the authenticated user current bankroll as the signed sum of their active-account ledger.';
