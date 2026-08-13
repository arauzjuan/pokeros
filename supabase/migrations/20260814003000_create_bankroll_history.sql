create or replace function public.bankroll_history_by_range(
  p_range text,
  p_currency text default null
)
returns table(event_date date, bankroll numeric)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_from_date date;
  v_opening_balance numeric(14, 2);
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_range not in ('7_days', '30_days', 'this_month', 'this_year', 'all_time') then
    raise exception 'INVALID_METRICS_RANGE';
  end if;

  select coalesce(p_currency, default_currency)
    into v_currency
    from public.profiles
   where id = v_user_id;
  if v_currency is null or v_currency !~ '^[A-Z]{3}$' then raise exception 'INVALID_CURRENCY'; end if;

  v_from_date := case p_range
    when '7_days' then current_date - 6
    when '30_days' then current_date - 29
    when 'this_month' then date_trunc('month', current_date)::date
    when 'this_year' then date_trunc('year', current_date)::date
    else null
  end;

  if v_from_date is null then
    select coalesce(min(bt.occurred_at::date), current_date)
      into v_from_date
      from public.bankroll_transactions bt
      join public.bankroll_accounts ba on ba.id = bt.account_id and ba.user_id = bt.user_id
     where bt.user_id = v_user_id and bt.currency = v_currency and ba.is_active;
  end if;

  select coalesce(sum(bt.amount), 0)::numeric(14, 2)
    into v_opening_balance
    from public.bankroll_transactions bt
    join public.bankroll_accounts ba on ba.id = bt.account_id and ba.user_id = bt.user_id
   where bt.user_id = v_user_id and bt.currency = v_currency and ba.is_active
     and bt.occurred_at < v_from_date::timestamptz;

  return query
  with calendar as (
    select day::date as event_date
    from generate_series(v_from_date, current_date, interval '1 day') day
  ), daily as (
    select bt.occurred_at::date as event_date, sum(bt.amount) as amount
    from public.bankroll_transactions bt
    join public.bankroll_accounts ba on ba.id = bt.account_id and ba.user_id = bt.user_id
    where bt.user_id = v_user_id and bt.currency = v_currency and ba.is_active
      and bt.occurred_at >= v_from_date::timestamptz
      and bt.occurred_at < (current_date + 1)::timestamptz
    group by bt.occurred_at::date
  )
  select
    calendar.event_date,
    (v_opening_balance + sum(coalesce(daily.amount, 0)) over (order by calendar.event_date))::numeric(14, 2)
  from calendar
  left join daily using (event_date)
  order by calendar.event_date;
end;
$$;

revoke all on function public.bankroll_history_by_range(text, text) from public;
grant execute on function public.bankroll_history_by_range(text, text) to authenticated;

comment on function public.bankroll_history_by_range(text, text) is
  'Chronological daily bankroll reconstructed from every signed ledger movement.';
