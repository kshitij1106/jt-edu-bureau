# Deploy cheat-sheet

The condensed version of README.md — keep this open while you work.
Full explanations are in README.md and apps-script/README.md if any
step here is unclear.

## A. Push to GitHub

```bash
cd jt-edu-bureau
git init
git add .
git commit -m "JT Education Bureau — Phase 1 site"
```

On github.com → **New repository** → name it `jt-edu-bureau` →
**Create repository** (leave "initialize with README" unchecked).
Copy the three commands GitHub shows you, they'll look like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/jt-edu-bureau.git
git branch -M main
git push -u origin main
```

## B. Deploy on Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → sign up free.
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** →
   select `jt-edu-bureau`.
3. Framework preset: **None**. Build command: leave blank. Build
   output directory: **`/`**.
4. **Save and Deploy** → wait ~1 minute → open the `.pages.dev` URL
   it gives you and click through the site.

## C. Point jtedubureau.com at it

1. Cloudflare dashboard → **Add a Site** → `jtedubureau.com` → note
   the two nameservers it gives you.
2. Namecheap → **Domain List → Manage → Nameservers → Custom DNS** →
   paste in those two nameservers → **Save**.
3. Wait for Cloudflare to show the domain as **Active** (usually
   under an hour, occasionally up to a day).
4. Cloudflare → your Pages project → **Custom domains** → **Add** →
   enter `jtedubureau.com`, then again for `www.jtedubureau.com`.

Done — `jtedubureau.com` now serves the site with free SSL. Any
future `git push` redeploys automatically.

## D. Sheets (do this before or after A–C, doesn't matter)

See `apps-script/README.md`. Sheet 1 (public) gets
`SetupPublicContentSheet.gs`; Sheet 2 (private) gets both `Code.gs`
and `Auth.gs` in the same script project. Paste the resulting Sheet
ID and Web App URL into `js/jt-data.js`, commit, push.
