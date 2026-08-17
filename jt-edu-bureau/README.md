# JT Education Bureau — website

A free website for JT Education Bureau Private Limited. Plain
HTML/CSS/JS (no build step), real accounts for students and tutors,
a public tutor directory, and editorial control over text/logo/
contact info — all driven by two Google Sheets, hosted free on
Cloudflare Pages, on your own domain. No paid services anywhere in
this stack.

**Status:** live at jtedubureau.com.

**The whole system in one sentence:** Sheet 1 is public and controls
what the site *says*; Sheet 2 is private and holds accounts, logins,
and who's interested in whom. See `apps-script/README.md` for the
full map — it's short on purpose.

## What's built

- **Pages:** Home, Browse tutors, How JT works, About, Subjects,
  Boards, Exams, Locations, FAQs, Contact, student/tutor login +
  dashboards, 404.
- **Design system:** one file, `css/styles.css` — a custom "registry/
  bureau" look (ledger lines, admit-card styling, the circular seal).
- **Logo:** `assets/logo-mark.svg`, the JT-as-π seal, vector.
- **Editorial control (Site Settings tab):** hero headline, hero
  subtext, tagline, logo, phone, email, address — change a cell,
  it updates on the live site, everywhere that field appears.
- **Content control (Subjects/Boards/Exams/Locations/Testimonials/
  FAQs tabs):** same pattern — edit a Sheet, the site updates.
- **Real accounts, phone + password:** salted, hashed 8,000×, never
  stored in plain text — including for you. To help someone who's
  locked out, type a new password into the "Reset Password" column
  in the Sheet; it hashes and clears itself automatically. Separate
  login for students (`find-a-tutor.html`) and tutors
  (`become-a-tutor.html`).
- **Student dashboard:** browse tutors, mark interest in one click
  (uses saved profile — no retyping), see status of past interests.
- **Tutor dashboard:** self-service profile — rate, description,
  subjects, location, a photo (1MB, stored in Drive) — plus a live
  count and list of interested students with enough detail to follow
  up. New accounts start unverified and invisible publicly until
  approved.
- **Public tutor directory (`tutors.html`):** filterable, swipeable
  carousel, sourced live from verified accounts via an API that only
  ever returns public-safe fields.
- **Live registry count:** homepage hero shows real numbers, honestly
  blank until connected — never a fabricated stat.
- **SEO basics:** `sitemap.xml`, `robots.txt`.
- **Self-serve debugging:** `/diagnostics.html` checks Sheet 1's
  connection and explains problems in plain language.

## What's intentionally not built

An admin dashboard for matching (still just reading the Interests
tab directly), and payments/commission tracking — the one piece that
will eventually need more than a spreadsheet, worth its own
conversation when the business is ready for it.

## 1. Set up your two Google Sheets

Follow `/apps-script/README.md`. You'll end up with a Sheet ID and a
Web App URL to paste into `js/jt-data.js`.

## 2. Put the code on GitHub

```bash
cd jt-edu-bureau
git init
git add .
git commit -m "JT Education Bureau site"
```

On github.com: **New repository** → `jt-edu-bureau` → **Create**
(don't add a README, you have one). Then run the commands it shows:

```bash
git remote add origin https://github.com/YOUR-USERNAME/jt-edu-bureau.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Cloudflare Pages

(Not Vercel — its free tier's terms exclude commercial use; Cloudflare's don't.)

1. Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Pages → Connect to Git** → your repo.
3. Framework preset **None**, build command **blank**, build output
   directory **`/`**.
4. **Save and Deploy** — live at a `.pages.dev` URL in about a minute.

## 4. Connect jtedubureau.com

1. Cloudflare: **Add a Site** → `jtedubureau.com` → note the two
   nameservers it gives you.
2. Namecheap: **Domain List → Manage → Nameservers → Custom DNS** →
   paste those nameservers → **Save**.
3. Once Cloudflare shows the domain **Active**: your Pages project →
   **Custom domains** → add `jtedubureau.com` and `www.jtedubureau.com`.

Namecheap stays your registrar; only DNS management moves, for free.

## Editing things yourself

- **Hero text, tagline, logo, phone, email, address:** the **Site
  Settings** tab in Sheet 1. This is the one to bookmark.
- **Subjects/boards/exams/locations/testimonials/FAQs:** their tabs
  in Sheet 1.
- **A tutor's rate, description, photo, location:** the tutor edits
  these themselves — you only ever touch `Verified`.
- **Colors, fonts, spacing:** `css/styles.css`, under `:root`.
- **Page copy that isn't Settings-driven:** the relevant `.html`
  file directly — plain readable markup, no build step.
- **A new nav page:** copy an existing `.html` file's structure, add
  it to `JT_NAV_LINKS` in `js/site.js`.

None of this needs a rebuild or touching Cloudflare — push to GitHub
and it redeploys automatically in about a minute.

## What's next

A lightweight admin view of the Interests tab (currently just read
directly in the Sheet), and ratings/reviews feeding the public
directory both still fit this same free stack. Payments and
commission tracking are the one piece that eventually needs more
than a spreadsheet — worth its own conversation when you're ready.
