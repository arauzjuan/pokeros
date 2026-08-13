create or replace function public.update_tournament_result(
  p_tournament_id uuid,
  p_name text,
  p_played_at date,
  p_platform text,
  p_mode text,
  p_currency text,
  p_buy_in numeric,
  p_reentries integer,
  p_reentry_cost numeric,
  p_prize numeric,
  p_bounties numeric,
  p_finish_position integer default null,
  p_field_size integer default null,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_total_invested numeric(14, 2);
  v_total_return numeric(14, 2);
  v_net_profit numeric(14, 2);
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;

  perform 1 from public.tournaments
   where id = p_tournament_id and user_id = v_user_id
   for update;
  if not found then raise exception 'TOURNAMENT_NOT_FOUND'; end if;

  if p_name is null or length(trim(p_name)) < 2 or length(trim(p_name)) > 120 then
    raise exception 'INVALID_TOURNAMENT_NAME';
  end if;
  if p_played_at is null or p_played_at > current_date then raise exception 'INVALID_PLAYED_AT'; end if;
  if p_platform not in ('ggpoker', 'pokerstars', 'wpt-global', 'acr', '888poker', 'live', 'other')
    or p_mode not in ('mtt', 'pko', 'mystery-bounty', 'sit-and-go', 'cash')
    or p_currency !~ '^[A-Z]{3}$' then
    raise exception 'INVALID_TOURNAMENT_CLASSIFICATION';
  end if;
  if p_buy_in < 0 or p_reentries < 0 or p_reentry_cost < 0 or p_prize < 0 or p_bounties < 0 then
    raise exception 'NEGATIVE_FINANCIAL_VALUE';
  end if;
  if (p_finish_position is not null and p_finish_position < 1)
    or (p_field_size is not null and p_field_size < 1)
    or (p_finish_position is not null and p_field_size is not null and p_finish_position > p_field_size) then
    raise exception 'INVALID_FINISH_POSITION';
  end if;
  if p_notes is not null and length(p_notes) > 1000 then raise exception 'NOTES_TOO_LONG'; end if;

  v_total_invested := round(p_buy_in + (p_reentries * p_reentry_cost), 2);
  v_total_return := round(p_prize + p_bounties, 2);
  v_net_profit := round(v_total_return - v_total_invested, 2);

  select id into v_account_id
    from public.bankroll_accounts
   where user_id = v_user_id and currency = p_currency and is_active
   order by created_at limit 1;
  if v_account_id is null then raise exception 'ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND'; end if;

  update public.tournaments set
    name = trim(p_name), venue = p_platform, platform = p_platform, mode = p_mode,
    format = case when p_platform = 'live' then 'live' else 'online' end,
    starts_at = p_played_at::timestamptz, ended_at = p_played_at::timestamptz,
    buy_in = p_buy_in, reentries = p_reentries, reentry_cost = p_reentry_cost,
    prize = p_prize, bounties = p_bounties, total_invested = v_total_invested,
    total_return = v_total_return, net_profit = v_net_profit, currency = p_currency,
    finish_position = p_finish_position, field_size = p_field_size,
    notes = nullif(trim(p_notes), ''), updated_at = now()
  where id = p_tournament_id and user_id = v_user_id;

  delete from public.bankroll_transactions
   where tournament_id = p_tournament_id and user_id = v_user_id;

  if v_total_invested > 0 then
    insert into public.bankroll_transactions (
      user_id, account_id, tournament_id, transaction_type, amount, currency, occurred_at, description
    ) values (
      v_user_id, v_account_id, p_tournament_id, 'buy_in', -v_total_invested,
      p_currency, p_played_at::timestamptz, 'Inversión: ' || trim(p_name)
    );
  end if;
  if v_total_return > 0 then
    insert into public.bankroll_transactions (
      user_id, account_id, tournament_id, transaction_type, amount, currency, occurred_at, description
    ) values (
      v_user_id, v_account_id, p_tournament_id, 'prize', v_total_return,
      p_currency, p_played_at::timestamptz, 'Retorno: ' || trim(p_name)
    );
  end if;

  return p_tournament_id;
end;
$$;

revoke all on function public.update_tournament_result(
  uuid, text, date, text, text, text, numeric, integer, numeric, numeric, numeric, integer, integer, text
) from public;
grant execute on function public.update_tournament_result(
  uuid, text, date, text, text, text, numeric, integer, numeric, numeric, numeric, integer, integer, text
) to authenticated;
