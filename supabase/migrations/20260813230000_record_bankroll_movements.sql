create or replace function public.record_bankroll_movement(
  p_type text,
  p_amount numeric,
  p_occurred_at date,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_currency text;
  v_account_id uuid;
  v_current_balance numeric(14, 2);
  v_transaction_id uuid;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_type not in ('deposit', 'withdrawal') then raise exception 'INVALID_MOVEMENT_TYPE'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 999999999999.99 then
    raise exception 'INVALID_AMOUNT';
  end if;
  if p_occurred_at is null or p_occurred_at > current_date then raise exception 'INVALID_OCCURRED_AT'; end if;
  if p_notes is not null and length(trim(p_notes)) > 500 then raise exception 'NOTES_TOO_LONG'; end if;

  select default_currency into v_currency from public.profiles where id = v_user_id;

  select id into v_account_id
    from public.bankroll_accounts
   where user_id = v_user_id and currency = v_currency and is_active
   order by created_at
   limit 1
   for update;
  if v_account_id is null then raise exception 'ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND'; end if;

  if p_type = 'withdrawal' then
    select coalesce(sum(amount), 0)::numeric(14, 2) into v_current_balance
      from public.bankroll_transactions
     where user_id = v_user_id and currency = v_currency
       and account_id in (
         select id from public.bankroll_accounts
         where user_id = v_user_id and currency = v_currency and is_active
       );
    if v_current_balance < p_amount then raise exception 'INSUFFICIENT_BANKROLL'; end if;
  end if;

  insert into public.bankroll_transactions (
    user_id, account_id, transaction_type, amount, currency, occurred_at, description
  ) values (
    v_user_id, v_account_id, p_type,
    case when p_type = 'withdrawal' then -round(p_amount, 2) else round(p_amount, 2) end,
    v_currency, p_occurred_at::timestamptz,
    coalesce(nullif(trim(p_notes), ''), case when p_type = 'deposit' then 'Depósito manual' else 'Retiro manual' end)
  ) returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

revoke all on function public.record_bankroll_movement(text, numeric, date, text) from public;
grant execute on function public.record_bankroll_movement(text, numeric, date, text) to authenticated;
