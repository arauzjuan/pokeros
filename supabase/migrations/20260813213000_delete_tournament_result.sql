create or replace function public.delete_tournament_result(p_tournament_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;

  perform 1 from public.tournaments
   where id = p_tournament_id and user_id = v_user_id
   for update;
  if not found then raise exception 'TOURNAMENT_NOT_FOUND'; end if;

  delete from public.bankroll_transactions
   where tournament_id = p_tournament_id and user_id = v_user_id;

  delete from public.tournaments
   where id = p_tournament_id and user_id = v_user_id;

  return p_tournament_id;
end;
$$;

revoke all on function public.delete_tournament_result(uuid) from public;
grant execute on function public.delete_tournament_result(uuid) to authenticated;
