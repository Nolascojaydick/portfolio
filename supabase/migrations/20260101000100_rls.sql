-- Row Level Security: default deny, every grant explicit.

-- Invoker function (not security definer): it only sees what admin_users' own
-- policy allows, i.e. the caller's own row.
create or replace function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

alter table public.admin_users enable row level security;
create policy "admins read own row" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));
-- No write policies: admins are added only via SQL editor or CLI.

-- Public read-only tables
do $$
declare t text;
begin
  foreach t in array array['profiles','skills','experience','education','certifications','tags']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- Published-only content
alter table public.projects enable row level security;
create policy "public read published" on public.projects
  for select to anon, authenticated using (published);

alter table public.blog_posts enable row level security;
create policy "public read published" on public.blog_posts
  for select to anon, authenticated
  using (published and (published_at is null or published_at <= now()));

alter table public.project_images enable row level security;
create policy "public read images of published" on public.project_images
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));

alter table public.project_tags enable row level security;
create policy "public read tags of published projects" on public.project_tags
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));

alter table public.post_tags enable row level security;
create policy "public read tags of published posts" on public.post_tags
  for select to anon, authenticated
  using (exists (select 1 from public.blog_posts b where b.id = post_id and b.published));

alter table public.site_settings enable row level security;
create policy "public read public settings" on public.site_settings
  for select to anon, authenticated using (key like 'public.%');

-- contact_messages: no public policy. Submissions are written server-side with
-- the service-role key (Phase 6); only admins can read.
alter table public.contact_messages enable row level security;

-- Admin full access on every table
do $$
declare t text;
begin
  foreach t in array array['profiles','projects','project_images','skills','experience',
    'education','certifications','blog_posts','tags','project_tags','post_tags',
    'site_settings','contact_messages']
  loop
    execute format('create policy "admin all" on public.%I for all to authenticated
                    using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

revoke all on public.contact_messages, public.admin_users from anon;
