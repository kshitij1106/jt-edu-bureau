# JT Education Bureau — website (Phase 1)

A free, no-backend public website for JT Education Bureau Private
Limited: plain HTML/CSS/JS, content pulled live from a Google Sheet,
lead forms written to a private Google Sheet, hosted free on
Cloudflare Pages, on your own domain. No paid services anywhere in
this stack.

## What's built so far

- **Pages:** Home, Find a tutor, Become a tutor, Subjects, Boards,
  Exams, Locations, How JT works, About, FAQs, Contact.
- **Design system:** a custom "registry/bureau" look (ledger lines,
  admit-card styling, the circular seal mark) — all in
  `css/styles.css`, one file, easy to retheme.
- **Logo:** `assets/logo-mark.svg` — the JT-as-π seal. Vector, so it
  scales to any size with no quality loss.
- **Content layer:** subjects, boards, exams, locations, testimonials
  and FAQs are all read live from a Google Sheet you control —
  edit a cell, the site updates. Nothing is hardcoded.
- **Lead capture:** all three forms (tutor request, tutor
  application, contact) write straight into a private Google Sheet
  via a free Apps Script endpoint.

## What's not built yet (Phase 2/3, see below)

Student/tutor login accounts, automated matching, masked contact
details, tutor document verification, payments and commission
tracking. These need a real backend and real security, not a
spreadsheet — see "What's next" at the bottom.

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
  FAQs):** edit the public Google Sheet. Live on next page load.
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

## What's next (Phase 2 and 3)

When you're ready to move beyond manual matching:

- **Phase 2 — accounts, verification, matching:** needs a real
  database with actual per-user security (a spreadsheet can't safely
  mask a tutor's phone number from a student, or store an ID
  document privately). Supabase's free tier comfortably covers your
  current scale and is a natural next step.
- **Phase 3 — payments & commission tracking:** added once Phase 2's
  accounts exist, through a sandboxed Indian payment gateway before
  handling real transactions.

Bring either of these back to a chat with Claude when you're ready —
the current site and this README give a working, complete starting
point either way.
