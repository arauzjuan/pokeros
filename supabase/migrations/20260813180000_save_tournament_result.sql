alter table public.tournaments
  add column platform text not null default 'other'
    check (platform in ('ggpoker', 'pokerstars', 'wpt-global', 'acr', '888poker', 'live', 'other')),
  add column mode text not null default 'mtt'
    check (mode in ('mtt', 'pko', 'mystery-bounty', 'sit-and-go', 'cash')),
  add column reentry_cost numeric(14, 2) not null default 0 check (reentry_cost >= 0),
  add column bounties numeric(14, 2) not null default 0 check (bounties >= 0),
  add column total_invested numeric(14, 2) not null default 0 check (total_invested >= 0),
  add column total_return numeric(14, 2) not null default 0 check (total_return >= 0),
  add column net_profit numeric(14, 2) not null default 0,
  add column finish_position integer check (finish_position > 0),
  add column field_size integer check (field_size > 0),
  add constraint tournaments_position_within_field
    check (finish_position is null or field_size is null or finish_position <= field_size);

create or replace function public.save_tournament_result(
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
  v_tournament_id uuid;
  v_total_invested numeric(14, 2);
  v_total_return numeric(14, 2);
  v_net_profit numeric(14, 2);
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if p_name is null or length(trim(p_name)) < 2 or length(trim(p_name)) > 120 then
    raise exception 'INVALID_TOURNAMENT_NAME';
  end if;

  if p_played_at is null or p_played_at > current_date then
    raise exception 'INVALID_PLAYED_AT';
  end if;

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

  if p_notes is not null and length(p_notes) > 1000 then
    raise exception 'NOTES_TOO_LONG';
  end if;

  v_total_invested := round(p_buy_in + (p_reentries * p_reentry_cost), 2);
  v_total_return := round(p_prize + p_bounties, 2);
  v_net_profit := round(v_total_return - v_total_invested, 2);

  select id
    into v_account_id
    from public.bankroll_accounts
   where user_id = v_user_id
     and currency = p_currency
     and is_active
   order by created_at
   limit 1;

  if v_account_id is null then
    raise exception 'ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND';
  end if;

  insert into public.tournaments (
    user_id, name, venue, platform, mode, format, status, starts_at, ended_at,
    buy_in, reentries, reentry_cost, prize, bounties, total_invested,
    total_return, net_profit, currency, finish_position, field_size, notes
  ) values (
    v_user_id, trim(p_name), p_platform, p_platform, p_mode,
    case when p_platform = 'live' then 'live' else 'online' end,
    'completed', p_played_at::timestamptz, p_played_at::timestamptz,
    p_buy_in, p_reentries, p_reentry_cost, p_prize, p_bounties,
    v_total_invested, v_total_return, v_net_profit, p_currency,
    p_finish_position, p_field_size, nullif(trim(p_notes), '')
  )
  returning id into v_tournament_id;

  if v_total_invested > 0 then
    insert into public.bankroll_transactions (
      user_id, account_id, tournament_id, transaction_type, amount,
      currency, occurred_at, description
    ) values (
      v_user_id, v_account_id, v_tournament_id, 'buy_in', -v_total_invested,
      p_currency, p_played_at::timestamptz, 'Inversión: ' || trim(p_name)
    );
  end if;

  if v_total_return > 0 then
    insert into public.bankroll_transactions (
      user_id, account_id, tournament_id, transaction_type, amount,
      currency, occurred_at, description
    ) values (
      v_user_id, v_account_id, v_tournament_id, 'prize', v_total_return,
      p_currency, p_played_at::timestamptz, 'Retorno: ' || trim(p_name)
    );
  end if;

  return v_tournament_id;
end;
$$;

revoke all on function public.save_tournament_result(
  text, date, text, text, text, numeric, integer, numeric, numeric, numeric, integer, integer, text
) from public;

grant execute on function public.save_tournament_result(
  text, date, text, text, text, numeric, integer, numeric, numeric, numeric, integer, integer, text
) to authenticated;
