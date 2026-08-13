create or replace function public.player_metrics(p_currency text default null)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_tournaments bigint;
  v_invested numeric(14, 2);
  v_returns numeric(14, 2);
  v_profit numeric(14, 2);
  v_itm_tournaments bigint;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;

  select coalesce(p_currency, default_currency)
    into v_currency
    from public.profiles
   where id = v_user_id;
  if v_currency is null or v_currency !~ '^[A-Z]{3}$' then raise exception 'INVALID_CURRENCY'; end if;

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
    and status = 'completed';

  return jsonb_build_object(
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

revoke all on function public.player_metrics(text) from public;
grant execute on function public.player_metrics(text) to authenticated;

comment on function public.player_metrics(text) is
  'Single source for authenticated player tournament metrics in one currency.';
