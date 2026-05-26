alter table public.maintenance_requests
  add column if not exists assignee_text text,
  add column if not exists estimate_text text;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('properties', 'properties', false)
on conflict (id) do nothing;

drop policy if exists "propflow avatar objects readable by owner" on storage.objects;
create policy "propflow avatar objects readable by owner"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "propflow avatar objects insertable by owner" on storage.objects;
create policy "propflow avatar objects insertable by owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "propflow avatar objects updatable by owner" on storage.objects;
create policy "propflow avatar objects updatable by owner"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "propflow avatar objects deletable by owner" on storage.objects;
create policy "propflow avatar objects deletable by owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "propflow property media readable by members" on storage.objects;
create policy "propflow property media readable by members"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'properties'
    and exists (
      select 1
      from public.properties p
      where p.workspace_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
        and private.is_workspace_member(p.workspace_id, null)
    )
  );

drop policy if exists "propflow property media insertable by operators" on storage.objects;
create policy "propflow property media insertable by operators"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'properties'
    and exists (
      select 1
      from public.properties p
      where p.workspace_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
        and private.is_workspace_member(
          p.workspace_id,
          array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
        )
    )
  );

drop policy if exists "propflow property media updatable by operators" on storage.objects;
create policy "propflow property media updatable by operators"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'properties'
    and exists (
      select 1
      from public.properties p
      where p.workspace_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
        and private.is_workspace_member(
          p.workspace_id,
          array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
        )
    )
  )
  with check (
    bucket_id = 'properties'
    and exists (
      select 1
      from public.properties p
      where p.workspace_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
        and private.is_workspace_member(
          p.workspace_id,
          array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
        )
    )
  );

drop policy if exists "propflow property media deletable by operators" on storage.objects;
create policy "propflow property media deletable by operators"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'properties'
    and exists (
      select 1
      from public.properties p
      where p.workspace_id::text = (storage.foldername(name))[1]
        and p.id::text = (storage.foldername(name))[2]
        and private.is_workspace_member(
          p.workspace_id,
          array['platform_admin', 'workspace_admin', 'manager']::public.workspace_role[]
        )
    )
  );
