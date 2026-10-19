# Portfolio: Next.js + Supabase + Vercel

Public portfolio (projects, skills, experience, blog, contact) with a protected admin dashboard. Content lives in Supabase, so routine updates never touch the code.

## Local setup
```bash
npm install
copy .env.example .env.local      # Mac/Linux: cp .env.example .env.local
npx supabase login
npx supabase link --project-ref <your-20-letter-ref>
npx supabase db push              # applies every file in supabase/migrations
npm run dev
```
Fill `.env.local` with the Supabase URL, publishable key and (for the contact form and résumé) the service-role key. Optional sample data: paste `supabase/seed.sql` into the SQL editor.

### First administrator (manual, by design)
1. Dashboard > Authentication > Users > Add user (auto-confirm).
2. SQL editor: `insert into public.admin_users (user_id) values ('<that user uid>');`

### Generate database types (optional)
`npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`

## Scripts
| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript check |
| `npm run test:unit` | Validation, slug and file-sniffing tests (no network) |
| `npm run test:rls` | Row Level Security tests against your real Supabase project |
| `npm run build` | Production build |

## Deploy to Vercel
1. Push the code to GitHub. `.env.local` is git-ignored; never commit secrets.
2. Vercel > Add New > Project > import the repository (framework: Next.js).
3. Settings > Environment Variables, add for Production (and Preview if you use it):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (keep it marked Sensitive), `NEXT_PUBLIC_SITE_URL` (your live URL, no trailing slash), and optionally `RATE_LIMIT_SALT`, `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `CONTACT_FROM_EMAIL`.
   Local `.env.local` values are **not** copied to Vercel automatically.
4. Deploy.
5. Supabase > Authentication > URL Configuration: set **Site URL** to your live domain and add `https://your-domain/**` to **Redirect URLs**.
6. Visit `/admin`, sign in, and go through `docs/MANUAL-TESTS.md`.
7. Optional: add a custom domain in Vercel, then update `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL, and redeploy.
8. Use a separate Supabase project for Preview deployments if you want production data isolated.

## Notes
- Authorization is the `admin_users` allowlist, enforced by RLS (`public.is_admin()`) and re-checked in every admin page and server action.
- This project uses `src/middleware.ts` (Next.js 15). If you upgrade to Next.js 16, rename it to `proxy.ts` and export `proxy`.
- Uploaded images are public by design; résumés are private and served by short-lived signed links at `/resume`.
- Replacing an image or résumé leaves the old file in storage; delete it from the Supabase Storage dashboard to reclaim space.
- Security headers are set in `next.config.ts`. A strict Content-Security-Policy is not included; add one once you know which third-party scripts you use.
