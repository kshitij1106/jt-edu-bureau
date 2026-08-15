# JT Education Bureau — website

A free, no-backend public website for JT Education Bureau Private
Limited: plain HTML/CSS/JS, content pulled live from a Google Sheet,
lead forms written to a private Google Sheet, hosted free on
Cloudflare Pages, on your own domain. No paid services anywhere in
this stack — deliberately so, including staying off tools like
Supabase whose free tiers have real limits (e.g. very low outgoing
auth-email quotas) that would bite at real usage.

**Status:** live at jtedubureau.com. Sheets confirmed working.

## What's built so far

- **Pages:** Home, Find a tutor, Browse tutors, Become a tutor,
  Subjects, Boards, Exams, Locations, How JT works, About, FAQs,
  Contact, plus a 404 page.
- **Design system:** a custom "registry/bureau" look (ledger lines,
  admit-card styling, the circular seal mark) — all in
  `css/styles.css`, one file, easy to retheme.
- **Logo:** `assets/logo-mark.svg` — the JT-as-π seal. Vector, so it
  scales to any size with no quality loss.
- **Content layer:** subjects, boards, exams, locations, testimonials,
  tutors and FAQs are all read live from a Google Sheet you control —
  edit a cell, the site updates. Nothing is hardcoded.
- **Tutor directory:** `tutors.html` — a filterable (subject, region,
  mode), swipeable carousel of verified tutors, sourced from the same
  public Sheet. Only ever shows what's safe to be public (see the
  "Tutors" tab note in `apps-script/README.md`) — phone numbers and
  documents never leave the private leads sheet.
- **Lead capture:** all three forms (tutor request, tutor
  application, contact) write straight into a private Google Sheet
  via a free Apps Script endpoint.
- **SEO basics:** `sitemap.xml`, `robots.txt`.

## What's intentionally not built

Login accounts, in-app messaging, automated matching, and payments/
commission tracking. Discovery (browsing tutors) doesn't need any of
that — it's just published content. The things that genuinely do need
real accounts and security (a tutor's private documents, a masked
phone number) still go through your coordinator by hand for now,
same as the rest of the lead flow. If the business reaches a point
where that manual step is the bottleneck, that's a real backend
project (Supabase or similar) worth revisiting — not before.

## 1. Set up your two Google Sheets

Follow `/apps-script/README.md` step by step, then come back here.
You'll end up with two IDs/URLs to paste into `js/jt-data.js`.

## 2. Put the code on GitHub

```bash
cd jt-edu-bureau
git init
git add .
git commit -m "JT Education Bureau — Phase 1 site"
```

Then on github.com: **New repository** → name it e.g. `jt-edu-bureau`
→ **Create repository** (don't initialize with a README, you already
have one). It'll show you commands like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/jt-edu-bureau.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Cloudflare Pages (free, and — unlike Vercel's free
   tier — its terms allow a live business site)

1. Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** →
   pick your `jt-edu-bureau` repo.
3. Build settings: Framework preset **None**, build command **blank**,
   build output directory **`/`** (this site has no build step — it's
   already plain HTML).
4. Click **Save and Deploy**. In about a minute you'll get a live
   `jt-edu-bureau.pages.dev` URL — open it and check everything works.

## 4. Connect jtedubureau.com

The easiest, fully-free route:

1. In Cloudflare: **Add a Site** → enter `jtedubureau.com`. It scans
   your existing DNS and gives you two nameservers.
2. In Namecheap: **Domain List → Manage → Nameservers → Custom DNS**
   → paste in Cloudflare's two nameservers → **Save**. (Can take a
   few hours to take effect, occasionally up to a day.)
3. Back in Cloudflare, once the domain shows **Active**: go to your
   Pages project → **Custom domains** → **Add** → `jtedubureau.com`
   and `www.jtedubureau.com`. Cloudflare wires up the DNS
   automatically since it now manages the domain.
4. Visiting `jtedubureau.com` now serves your site, with free SSL
   (the padlock) applied automatically.

Namecheap stays your registrar (where you renew the domain each
year) — you're only moving *DNS management* to Cloudflare, which
costs nothing.

## Editing things yourself ("artistic control")

- **Text content (subjects, boards, exams, locations, testimonials,
  tutors, FAQs):** edit the public Google Sheet. Live on next page load.
- **Colors, fonts, spacing:** all in `css/styles.css`, at the top
  under `:root` — change a hex value, the whole site updates.
- **Copy on the homepage / form pages / about page:** edit the text
  directly inside the relevant `.html` file — it's plain readable
  HTML, no build step to run.
- **Logo:** `assets/logo-mark.svg` — editable in any vector tool
  (even free ones like Inkscape or Figma) if you ever want to adjust
  it.
- **Adding a brand-new page:** copy the structure of an existing
  `.html` file (they all share the same header/footer/fonts setup)
  and add a link to it in `js/site.js`'s `JT_NAV_LINKS`.

None of this needs a rebuild, a deploy step, or touching Cloudflare —
push a change to GitHub and Cloudflare redeploys automatically within
about a minute.

## What's next

The natural next additions that still fit the free, spreadsheet-based
stack: reviews/ratings feeding into the Tutors tab, a simple ticket
tab for support requests, an admin export view. All of these are
"add a tab, add a page" work, not "add a backend" work.

Payments and commission tracking are the one piece that will
eventually need something more than a spreadsheet (real transaction
records, a payment gateway). That's worth its own conversation when
the business is actually ready to take payments through the site
rather than directly.
