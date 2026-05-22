create extension if not exists "pgcrypto";

create type public.workspace_role as enum (
  'platform_admin',
  'workspace_admin',
  'manager',
  'owner',
  'cleaner',
  'maintenance_tech',
  'guest'
);

create type public.rental_model as enum ('short_term', 'long_term', 'mixed');
create type public.record_status as enum ('active', 'pending', 'disabled', 'archived');
create type public.booking_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
create type public.payment_status as enum ('paid', 'partial', 'unpaid', 'refunded');
create type public.task_status as enum ('pending', 'in_progress', 'awaiting_parts', 'completed', 'cancelled');
create type public.priority_level as enum ('low', 'routine', 'high', 'critical');
create type public.integration_status as enum ('connected', 'credential_required', 'syncing', 'disabled');
create type public.notification_channel as enum ('email', 'sms', 'push', 'in_app');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  slug text primary key,
  name text not null,
  monthly_price_cents integer,
  property_limit integer,
  paypal_plan_id text,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rental_model public.rental_model not null default 'mixed',
  plan_slug text references public.plans(slug) default 'professional',
  status public.record_status not null default 'active',
  owner_profile_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text,
  role public.workspace_role not null,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (workspace_id, email)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null default 'manager',
  token text not null default encode(gen_random_bytes(18), 'hex'),
  status public.record_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  plan_slug text references public.plans(slug),
  external_provider text not null default 'paypal',
  external_id text,
  status text not null default 'pending',
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_provider, external_id)
);

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  name text not null,
  email text,
  phone text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid references public.owners(id),
  name text not null,
  address text,
  city text,
  region text,
  country text default 'US',
  rental_model public.rental_model not null default 'mixed',
  status text not null default 'vacant',
  bedrooms numeric,
  bathrooms numeric,
  area text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  floor text,
  bedrooms numeric,
  bathrooms numeric,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  name text not null,
  email text,
  phone text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  name text not null,
  email text,
  phone text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  property_id uuid references public.properties(id),
  unit_id uuid references public.units(id),
  start_date date not null,
  end_date date,
  monthly_rent_cents integer not null,
  deposit_cents integer,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  external_listing_id text,
  status public.integration_status not null default 'credential_required',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  unit_id uuid references public.units(id),
  guest_id uuid references public.guests(id),
  channel_id uuid references public.channels(id),
  guest_name text,
  platform text not null default 'direct',
  check_in date,
  check_out date,
  status public.booking_status not null default 'confirmed',
  payment_status public.payment_status not null default 'unpaid',
  amount_cents integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.cleaning_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  booking_id uuid references public.bookings(id),
  assigned_to uuid references public.profiles(id),
  title text not null,
  scheduled_for timestamptz,
  status public.task_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  cleaning_task_id uuid not null references public.cleaning_tasks(id) on delete cascade,
  room text not null,
  label text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 0
);

create table public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  cleaning_task_id uuid references public.cleaning_tasks(id),
  reported_by uuid references public.profiles(id),
  category text not null,
  description text not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  unit_id uuid references public.units(id),
  issue_report_id uuid references public.issue_reports(id),
  requested_by uuid references public.profiles(id),
  title text not null,
  description text,
  priority public.priority_level not null default 'routine',
  status public.task_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  specialty text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  maintenance_request_id uuid references public.maintenance_requests(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  vendor_id uuid references public.vendors(id),
  status public.task_status not null default 'pending',
  estimated_cost_cents integer,
  final_cost_cents integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  bucket text not null default 'attachments',
  path text not null,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id),
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id),
  channel public.notification_channel not null,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, channel)
);

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  booking_id uuid references public.bookings(id),
  lease_id uuid references public.leases(id),
  type text not null,
  amount_cents integer not null,
  occurred_on date not null default current_date,
  memo text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id),
  work_order_id uuid references public.work_orders(id),
  category text not null,
  amount_cents integer not null,
  vendor text,
  incurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.owner_statements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid references public.owners(id),
  period_start date not null,
  period_end date not null,
  revenue_cents integer not null default 0,
  expenses_cents integer not null default 0,
  payout_cents integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  provider text not null,
  status public.integration_status not null default 'credential_required',
  external_account_id text,
  access_token_ref text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.plans (slug, name, monthly_price_cents, property_limit, features)
values
  ('starter', 'Starter', 4900, 10, '["Up to 10 properties", "Basic reporting", "Tenant portal access"]'),
  ('professional', 'Professional', 14900, 50, '["Up to 50 properties", "Advanced analytics", "Automated workflows", "Owner portal"]'),
  ('enterprise', 'Enterprise', null, null, '["Unlimited properties", "Custom integrations", "Dedicated success manager"]')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.owners enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.guests enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.channels enable row level security;
alter table public.bookings enable row level security;
alter table public.cleaning_tasks enable row level security;
alter table public.checklist_items enable row level security;
alter table public.issue_reports enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.vendors enable row level security;
alter table public.work_orders enable row level security;
alter table public.attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.expenses enable row level security;
alter table public.owner_statements enable row level security;
alter table public.integrations enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.plans to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_workspace_member(
  target_workspace_id uuid,
  required_roles public.workspace_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.workspace_id = target_workspace_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and (required_roles is null or m.role = any(required_roles))
  );
$$;

revoke all on function private.is_workspace_member(uuid, public.workspace_role[]) from public;
grant execute on function private.is_workspace_member(uuid, public.workspace_role[]) to authenticated;

create policy "plans are publicly readable" on public.plans
  for select using (true);

create policy "profiles can read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "profiles can update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles can insert own profile" on public.profiles
  for insert with check (id = auth.uid());

create policy "memberships visible to own user" on public.memberships
  for select using (
    user_id = auth.uid()
    or private.is_workspace_member(
      memberships.workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

create policy "workspaces visible by membership" on public.workspaces
  for select using (private.is_workspace_member(workspaces.id, null));

create policy "workspace admins can update workspaces" on public.workspaces
  for update using (
    private.is_workspace_member(
      workspaces.id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

create policy "authenticated users can create workspaces" on public.workspaces
  for insert with check (auth.uid() is not null);

create policy "workspace members can read invitations" on public.invitations
  for select using (private.is_workspace_member(invitations.workspace_id, null));

create policy "workspace admins manage invitations" on public.invitations
  for all using (
    private.is_workspace_member(
      invitations.workspace_id,
      array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
    )
  ) with check (
    private.is_workspace_member(
      invitations.workspace_id,
      array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
    )
  );

create policy "members can read workspace scoped subscriptions" on public.subscriptions
  for select using (private.is_workspace_member(subscriptions.workspace_id, null));

create policy "service-style subscription writes via members" on public.subscriptions
  for all using (
    private.is_workspace_member(
      subscriptions.workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  ) with check (
    private.is_workspace_member(
      subscriptions.workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

create policy "memberships readable by workspace members" on public.memberships
  for select using (
    user_id = auth.uid()
    or private.is_workspace_member(memberships.workspace_id, null)
  );

create policy "workspace admins manage memberships" on public.memberships
  for all using (
    private.is_workspace_member(
      memberships.workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  ) with check (
    private.is_workspace_member(
      memberships.workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

do $$
declare
  t text;
begin
  foreach t in array array[
    'owners',
    'properties',
    'units',
    'guests',
    'tenants',
    'leases',
    'channels',
    'bookings',
    'cleaning_tasks',
    'checklist_items',
    'issue_reports',
    'maintenance_requests',
    'vendors',
    'work_orders',
    'attachments',
    'notifications',
    'notification_preferences',
    'financial_transactions',
    'expenses',
    'owner_statements',
    'integrations',
    'audit_logs'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (private.is_workspace_member(%I.workspace_id, null))',
      t || '_workspace_read',
      t,
      t
    );

    execute format(
      'create policy %I on public.%I for insert with check (private.is_workspace_member(%I.workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'', ''cleaner'', ''maintenance_tech'']::public.workspace_role[]))',
      t || '_workspace_insert',
      t,
      t
    );

    execute format(
      'create policy %I on public.%I for update using (private.is_workspace_member(%I.workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'', ''cleaner'', ''maintenance_tech'']::public.workspace_role[])) with check (private.is_workspace_member(%I.workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'', ''cleaner'', ''maintenance_tech'']::public.workspace_role[]))',
      t || '_workspace_update',
      t,
      t,
      t
    );

    execute format(
      'create policy %I on public.%I for delete using (private.is_workspace_member(%I.workspace_id, array[''platform_admin'', ''workspace_admin'']::public.workspace_role[]))',
      t || '_workspace_delete',
      t,
      t
    );
  end loop;
end $$;

create policy "workspace members read attachment objects" on storage.objects
  for select using (
    bucket_id = 'attachments'
    and exists (
      select 1
      from public.attachments a
      join public.memberships m on m.workspace_id = a.workspace_id
      where a.path = storage.objects.name
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy "workspace members upload attachment objects" on storage.objects
  for insert with check (
    bucket_id = 'attachments'
    and auth.uid() is not null
  );

create policy "workspace members update attachment objects" on storage.objects
  for update using (
    bucket_id = 'attachments'
    and auth.uid() is not null
  ) with check (
    bucket_id = 'attachments'
    and auth.uid() is not null
  );

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
