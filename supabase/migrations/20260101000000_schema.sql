-- Core schema. Auth identities live in auth.users; nothing here stores passwords.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- Administrator allowlist: rows are added only by the project owner (SQL editor / CLI).
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  professional_title text not null,
  biography text not null default '',
  location text,
  avatar_url text,
  resume_url text,
  public_email text,
  github_url text,
  linkedin_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null default '',
  description text not null default '',
  cover_image_url text,
  repository_url text,
  live_demo_url text,
  category text,
  featured boolean not null default false,
  published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index projects_published_idx on public.projects (published, display_order);
create index projects_featured_idx on public.projects (featured) where published;
create index projects_category_idx on public.projects (category);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id, display_order);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  icon text,
  proficiency_level smallint check (proficiency_level between 1 and 5),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  job_title text not null,
  employment_type text,
  description text not null default '',
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_current or end_date is not null),
  check (end_date is null or end_date >= start_date)
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field_of_study text,
  description text not null default '',
  start_date date,
  end_date date,
  credential_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuing_organization text not null,
  issue_date date,
  expiration_date date,
  credential_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '',
  content text not null default '',  -- Markdown, sanitized at render time
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_pub_idx on public.blog_posts (published, published_at desc);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (project_id, tag_id)
);
create index project_tags_tag_idx on public.project_tags (tag_id);

create table public.post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
create index post_tags_tag_idx on public.post_tags (tag_id);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) between 1 and 120),
  sender_email text not null check (char_length(sender_email) between 3 and 254),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 5000),
  is_read boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index contact_messages_inbox_idx on public.contact_messages (is_read, created_at desc);

-- Allowlisted keys: 'public.seo', 'public.social', 'public.site'.
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('public.seo', 'public.social', 'public.site')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['profiles','projects','skills','experience','education',
                           'certifications','blog_posts','site_settings']
  loop
    execute format('create trigger %I before update on public.%I
                    for each row execute function public.set_updated_at()', t||'_updated_at', t);
  end loop;
end $$;
