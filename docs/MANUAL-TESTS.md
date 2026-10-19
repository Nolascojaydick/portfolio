# Manual test checklist (needs your real Supabase project)

**Public site**
- [ ] Home, About, Projects, Skills, Experience, Blog, Contact load on phone width and desktop.
- [ ] Projects search and filters work; a no-match search shows the empty state.
- [ ] Project and blog detail pages load; an unpublished slug shows "Page not found".

**Admin**
- [ ] Wrong password shows an error; the right one opens the dashboard; Sign out works.
- [ ] Create, edit and delete a project, skill, experience, education, certification and post.
- [ ] Publish and unpublish change what the public site shows (allow up to a minute).
- [ ] A duplicate slug is rejected with a clear message.
- [ ] Upload a cover image, avatar and gallery image; replacing and removing work.
- [ ] A `.txt` file renamed to `.png` is rejected.
- [ ] Upload a résumé PDF; `/resume` downloads it; the file is not publicly readable in Storage.
- [ ] Settings: change your name and the SEO title; the public site and browser tab update.

**Contact and messages**
- [ ] Submit the form: success message appears and the message shows in Admin > Messages.
- [ ] Invalid email or short message shows field errors and keeps what you typed.
- [ ] Mark read/unread, archive, search and delete (with confirmation) work.
- [ ] Optional: email notification arrives when the Resend variables are set.
