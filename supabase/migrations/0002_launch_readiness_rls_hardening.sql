create or replace function private.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles public.workspace_role[]
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
      and m.role = any(allowed_roles)
  );
$$;

revoke all on function private.has_workspace_role(uuid, public.workspace_role[]) from public;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions',
    'owners',
    'financial_transactions',
    'expenses',
    'owner_statements'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_workspace_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_workspace_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_workspace_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_workspace_delete', t);
  end loop;
end $$;

create policy "subscriptions admin read" on public.subscriptions
  for select using (
    private.has_workspace_role(
      workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

create policy "subscriptions admin write" on public.subscriptions
  for all using (
    private.has_workspace_role(
      workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  ) with check (
    private.has_workspace_role(
      workspace_id,
      array['platform_admin', 'workspace_admin']::public.workspace_role[]
    )
  );

do $$
declare
  t text;
begin
  foreach t in array array[
    'owners',
    'financial_transactions',
    'expenses',
    'owner_statements'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (private.has_workspace_role(workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'', ''owner'']::public.workspace_role[]))',
      t || '_finance_read',
      t
    );
    execute format(
      'create policy %I on public.%I for all using (private.has_workspace_role(workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'']::public.workspace_role[])) with check (private.has_workspace_role(workspace_id, array[''platform_admin'', ''workspace_admin'', ''manager'']::public.workspace_role[]))',
      t || '_finance_write',
      t
    );
  end loop;
end $$;
