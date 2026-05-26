-- Push subscriptions: store web push subscription objects per user/workspace
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "workspace members can manage their push subscriptions"
  on public.push_subscriptions
  for all
  using (
    workspace_id in (
      select workspace_id from public.memberships
      where user_id = auth.uid() and status = 'active'
    )
  );

-- Integration credentials: store encrypted OAuth tokens per workspace/provider
create table if not exists public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

alter table public.integration_credentials enable row level security;

-- Only workspace_admin and manager can read/write integration credentials
create policy "admins and managers can manage integration credentials"
  on public.integration_credentials
  for all
  using (
    workspace_id in (
      select workspace_id from public.memberships
      where user_id = auth.uid()
        and status = 'active'
        and role in ('workspace_admin', 'manager', 'platform_admin')
    )
  );
