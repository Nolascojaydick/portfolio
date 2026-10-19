-- Development sample data only: no messages, no credentials.
insert into public.profiles (display_name, professional_title, biography, location)
values ('Your Name', 'Software Engineer', 'I build reliable web products, from database to interface.', 'Philippines');

insert into public.skills (name, category, display_order) values
  ('TypeScript', 'Frontend development', 1), ('React', 'Frontend development', 2),
  ('Next.js', 'Frontend development', 3), ('Node.js', 'Backend development', 1),
  ('PostgreSQL', 'Databases', 1), ('Supabase', 'Databases', 2),
  ('Vercel', 'DevOps and deployment', 1), ('Git', 'Tools and technologies', 1);

insert into public.experience (company, job_title, employment_type, description, start_date, is_current, display_order)
values ('Example Co.', 'Full-stack Developer', 'Full-time', 'Built and maintained customer-facing web apps.', '2023-01-01', true, 1);

insert into public.tags (name, slug) values ('Next.js', 'nextjs'), ('Supabase', 'supabase');

insert into public.projects (title, slug, short_description, description, category, featured, published, published_at) values
  ('Sample project', 'sample-project', 'A placeholder project to test the grid.', 'Replace me in the admin.', 'Web app', true, true, now()),
  ('Unpublished draft', 'draft-project', 'Must never appear publicly.', 'RLS test fixture.', 'Web app', false, false, null);

insert into public.project_tags select p.id, t.id from public.projects p, public.tags t where p.slug = 'sample-project';

insert into public.blog_posts (title, slug, excerpt, content, published, published_at)
values ('Hello, world', 'hello-world', 'First post.', 'Welcome to the blog.', true, now());
