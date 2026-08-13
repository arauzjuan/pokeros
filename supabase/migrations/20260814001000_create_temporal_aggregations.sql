create or replace function public.player_metrics_by_range(
  p_range text,
  p_currency text default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_from_date date;
  v_tournaments bigint;
  v_invested numeric(14, 2);
  v_returns numeric(14, 2);
  v_profit numeric(14, 2);
  v_itm_tournaments bigint;
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

  select
    count(*),
    coalesce(sum(total_invested), 0)::numeric(14, 2),
    coalesce(sum(total_return), 0)::numeric(14, 2),
    coalesce(sum(net_profit), 0)::numeric(14, 2),
    count(*) filter (where total_return > 0)
  into v_tournaments, v_invested, v_returns, v_profit, v_itm_tournaments
  from public.tournaments
  where user_id = v_user_id
    and currency = v_currency
    and status = 'completed'
    and (v_from_date is null or starts_at >= v_from_date::timestamptz)
    and starts_at < (current_date + 1)::timestamptz;

  return jsonb_build_object(
    'range', p_range,
    'from_date', v_from_date,
    'to_date', current_date,
    'total_tournaments', v_tournaments,
    'total_invested', v_invested,
    'total_returns', v_returns,
    'total_profit', v_profit,
    'roi', case when v_invested = 0 then 0 else round((v_profit / v_invested) * 100, 2) end,
    'abi', case when v_tournaments = 0 then 0 else round(v_invested / v_tournaments, 2) end,
    'itm', case when v_tournaments = 0 then 0 else round((v_itm_tournaments::numeric / v_tournaments) * 100, 2) end
  );
end;
$$;

revoke all on function public.player_metrics_by_range(text, text) from public;
grant execute on function public.player_metrics_by_range(text, text) to authenticated;

create or replace function public.player_metrics(p_currency text default null)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select public.player_metrics_by_range('all_time', p_currency);
$$;

comment on function public.player_metrics_by_range(text, text) is
  'Reusable player metrics for 7 days, 30 days, current month, current year or all time.';
