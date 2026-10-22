-- Server-only encrypted provider tokens. No client grants or RLS policies.
create table public.apple_provider_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null check (client_id in ('com.parentlybabytracking.app', 'com.parentlybabytracking.app.web')),
  encrypted_token text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, client_id)
);
alter table public.apple_provider_tokens enable row level security;
revoke all on public.apple_provider_tokens from public, anon, authenticated;
grant select, insert, update, delete on public.apple_provider_tokens to service_role;
