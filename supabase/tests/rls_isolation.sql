-- Run after the Core schema and RLS migrations. The transaction is rolled back,
-- so the test users and rows never persist.
begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'rls-user-a@pokeros.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'rls-user-b@pokeros.test',
    '',
    now(),
    now(),
    now()
  );

insert into public.profiles (id, display_name) values
  ('10000000-0000-0000-0000-000000000001', 'RLS User A'),
  ('20000000-0000-0000-0000-000000000002', 'RLS User B');

insert into public.tournaments (id, user_id, name, starts_at) values
  ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'Tournament A', now()),
  ('20000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', 'Tournament B', now());

insert into public.bankroll_accounts (id, user_id, name) values
  ('10000000-0000-0000-0000-000000000111', '10000000-0000-0000-0000-000000000001', 'Account A'),
  ('20000000-0000-0000-0000-000000000222', '20000000-0000-0000-0000-000000000002', 'Account B');

insert into public.bankroll_transactions (
  user_id,
  account_id,
  tournament_id,
  transaction_type,
  amount
) values
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000111', '10000000-0000-0000-0000-000000000011', 'deposit', 100),
  ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000222', '20000000-0000-0000-0000-000000000022', 'deposit', 200);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

do $$
declare
  visible_rows integer;
  changed_rows integer;
begin
  select count(*) into visible_rows from public.profiles;
  assert visible_rows = 1, 'User A must see only their profile';

  select count(*) into visible_rows from public.tournaments;
  assert visible_rows = 1, 'User A must see only their tournaments';

  select count(*) into visible_rows from public.bankroll_accounts;
  assert visible_rows = 1, 'User A must see only their bankroll accounts';

  select count(*) into visible_rows from public.bankroll_transactions;
  assert visible_rows = 1, 'User A must see only their bankroll transactions';

  update public.tournaments
  set name = 'Blocked update'
  where id = '20000000-0000-0000-0000-000000000022';
  get diagnostics changed_rows = row_count;
  assert changed_rows = 0, 'User A must not update User B data';

  delete from public.bankroll_accounts
  where id = '20000000-0000-0000-0000-000000000222';
  get diagnostics changed_rows = row_count;
  assert changed_rows = 0, 'User A must not delete User B data';

  begin
    insert into public.tournaments (user_id, name, starts_at)
    values (
      '20000000-0000-0000-0000-000000000002',
      'Blocked insert',
      now()
    );
    raise exception 'User A inserted data for User B';
  exception
    when insufficient_privilege then null;
  end;
end
$$;

rollback;
