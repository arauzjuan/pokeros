alter table public.profiles
  add column country text,
  add column primary_game_type text
    check (primary_game_type in ('mtt', 'cash', 'mixed')),
  add column onboarding_completed_at timestamptz;

alter table public.profiles
  add constraint profiles_display_name_length
    check (display_name is null or char_length(trim(display_name)) between 2 and 80),
  add constraint profiles_country_length
    check (country is null or char_length(trim(country)) between 2 and 80),
  add constraint profiles_supported_default_currency
    check (default_currency in ('USD', 'EUR', 'ARS', 'BRL', 'GBP', 'MXN'));
