# JT Education Bureau — website

A free website for JT Education Bureau Private Limited: plain
HTML/CSS/JS, marketing content pulled live from a Google Sheet, real
phone+password accounts for students and tutors backed by a second,
private Google Sheet, hosted free on Cloudflare Pages, on your own
domain. No paid services anywhere in this stack — deliberately so,
including staying off tools like Supabase whose free tiers have real
limits (e.g. very low outgoing auth-email quotas) that would bite at
real usage.

**Status:** live at jtedubureau.com.

## What's built so far

- **Pages:** Home, Browse tutors, How JT works, About, Subjects,
  Boards, Exams, Locations, FAQs, Contact, plus student and tutor
  login/register pages and dashboards, plus a 404 page.
- **Design system:** a custom "registry/bureau" look (ledger lines,
  admit-card styling, the circular seal mark) — all in
  `css/styles.css`, one file, easy to retheme.
- **Logo:** `assets/logo-mark.svg` — the JT-as-π seal. Vector, so it
  scales to any size with no quality loss.
- **Content layer:** subjects, boards, exams, locations, testimonials
  and FAQs are all read live from a public Google Sheet you control —
  edit a cell, the site updates. Nothing is hardcoded.
- **Real accounts, phone + password:** students/parents and tutors
  each get their own login (`find-a-tutor.html` and
  `become-a-tutor.html`). Passwords are salted and hashed thousands of
  times before storage, never stored in plain text — see the security
  note in `apps-script/README.md`.
- **Student dashboard** (`student-dashboard.html`): submit as many
  tutor requests as needed without retyping contact details each
  time, and see the status of every past request.
- **Tutor dashboard** (`tutor-dashboard.html`): tutors manage their
  own listing — rate per hour, description, subjects, classes,
  boards, location, mode, and a photo (1MB limit, stored in Drive) —
  updated instantly, no coordinator needed for routine edits. New
  accounts start unverified and invisible on the public directory
  until a coordinator approves them by hand in the Sheet.
- **Public tutor directory** (`tutors.html`): a filterable (subject,
  region, mode), swipeable carousel — sourced live from verified
  tutor accounts via a locked-down API endpoint that only ever
  returns public-safe fields (never phone, email, or credentials).
- **Live registry count:** the homepage hero shows real, current
  numbers (verified tutors, requests received, subjects covered) —
  never fabricated placeholders, and honestly blank until connected.
- **General contact form** (`contact.html`) still writes straight to
  the private sheet for one-off enquiries that don't need an account.
- **SEO basics:** `sitemap.xml`, `robots.txt`.
- **Rigid cells:** `apps-script/AddContentValidation.gs` turns every
  `Active` cell in the public Sheet into a dropdown.
- **Self-serve debugging:** `/diagnostics.html` on the live site checks
  your public Sheet connection tab-by-tab and explains what's wrong in
  plain language.

## What's intentionally not built

Admin dashboards for matching students to tutors (still done by a
coordinator reading the Requests and Tutor Accounts tabs directly),
in-app messaging, and payments/commission tracking. Payments in
particular are the one piece that will eventually need something more
than a spreadsheet — worth its own conversation when the business is
ready to take payments through the site rather than directly.

## 1. Set up your two Google Sheets

Follow `/apps-script/README.md` step by step, then come back here.
You'll end up with a Sheet ID and a Web App URL to paste into
`js/jt-data.js`.

## 2. Put the code on GitHub

```bash
cd jt-edu-bureau
git init
git add .
git commit -m "JT Education Bureau site"
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
  FAQs):** edit the public Google Sheet. Live on next page load.
- **A tutor's rate, description, photo, location:** the tutor edits
  these themselves at `/tutor-dashboard.html` — you don't touch a
  sheet for routine updates, only to flip `Verified` to `Yes` once.
- **Colors, fonts, spacing:** all in `css/styles.css`, at the top
  under `:root` — change a hex value, the whole site updates.
- **Copy on the homepage / about page / etc.:** edit the text
  directly inside the relevant `.html` file — plain readable HTML,
  no build step to run.
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

Natural next steps: a lightweight admin view of the Requests tab
(currently just read directly in the Sheet), tutors seeing which
requests they've been matched to from their own dashboard, and
ratings/reviews feeding into the public directory. All still fit the
free stack already in place.

Payments and commission tracking are the one piece that will
eventually need something more than a spreadsheet (real transaction
records, a payment gateway) — worth its own conversation when the
business is ready for it.
