# Security checklist (tick each one yourself before launch)

- [ ] `.env.local` is not in Git (`git status` never lists it).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` appears only in Vercel env vars and `.env.local`, never in client code.
- [ ] RLS is on for every table: Supabase > Database > Tables shows "RLS enabled" for all.
- [ ] `npm run test:rls` passes (with seed data and, ideally, admin and non-admin test accounts).
- [ ] Logged out, `/admin` redirects to the sign-in page.
- [ ] Logged out, `/projects/draft-project` shows "Page not found" and the draft is absent from `/sitemap.xml`.
- [ ] Anonymous SQL test returns nothing from `contact_messages`:
      `set role anon; select count(*) from public.contact_messages; reset role;`
- [ ] Storage: `resumes` is private; the three image buckets are the only public ones.
- [ ] Public sign-ups are disabled: Supabase > Authentication > turn off "Allow new users to sign up".
- [ ] The admin password is long and unique; consider enabling MFA on your Supabase and Vercel accounts.
- [ ] Contact form: the 6th message from one network within an hour is blocked.
- [ ] Supabase redirect URLs list only your real domains.
