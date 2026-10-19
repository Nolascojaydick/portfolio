-- Images are public by design; résumés are private (signed URLs only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('project-images', 'project-images', true,  5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('blog-images',    'blog-images',    true,  5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('profile-assets', 'profile-assets', true,  2097152, array['image/jpeg','image/png','image/webp']),
  ('resumes',        'resumes',        false, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Only admins may write or read through the API; public image buckets are still
-- served by URL. Résumés are readable only by admins (server issues signed URLs).
create policy "admin manage portfolio buckets" on storage.objects
  for all to authenticated
  using (bucket_id in ('project-images','blog-images','profile-assets','resumes') and (select public.is_admin()))
  with check (bucket_id in ('project-images','blog-images','profile-assets','resumes') and (select public.is_admin()));
