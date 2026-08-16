# Setting up your content & accounts Sheets

You need **two** Google Sheets — one public, one private. This is
deliberate, not extra work for no reason: one is shared openly (so
the site can read it with no login), and one never is (so phone
numbers and password hashes never sit somewhere the whole internet
can technically reach). Both are still 100% free.

## Sheet 1 — Public content (the site reads this)

**Fastest way — run the setup script:**

1. Create a new, blank Google Sheet.
2. **Extensions → Apps Script**, delete the placeholder code, paste in
   the full contents of `SetupPublicContentSheet.gs` from this folder.
3. In the toolbar, pick the function `setupPublicContentSheet` from
   the dropdown and click **Run**. Approve the permissions it asks
   for (it's your own script on your own sheet).
4. Switch back to the Sheet — six tabs now exist with headers and
   real starter rows already filled in. Edit, delete, or add to them
   as you like. Delete the leftover blank "Sheet1" tab if you want.
5. Skip to steps 4–6 below (share the sheet, then copy its ID).

**Or, the manual way** — if you'd rather build it by hand:

1. Create a new Google Sheet. Name it something like
   `JT Education Bureau — Public Content`.
2. Create these tabs, named **exactly** as below (case-sensitive).
   Row 1 of each is the header row — type these exact column names:

   | Tab name | Columns (row 1) |
   |---|---|
   | `Subjects` | `Name`, `Description`, `Tag`, `Active` |
   | `Boards` | `Name`, `Description`, `Tag`, `Active` |
   | `Exams` | `Name`, `Description`, `Tag`, `Active` |
   | `Locations` | `Name`, `Description`, `Tag`, `Active` |
   | `Testimonials` | `Name`, `Role`, `Quote`, `Rating`, `Active` |
   | `FAQs` | `Question`, `Answer`, `Active` |

   Set `Active` to `Yes` on any row you want visible on the site —
   leave it blank or set `No` to hide a row without deleting it.

3. Add a few real rows so the site has real content instead of the
   placeholder copy it falls back to.
4. Click **Share** (top right) → **General access** → change to
   **Anyone with the link** → role **Viewer**. This sheet has no
   personal data in it, so this is safe.
5. Copy the Sheet's ID out of its URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS-PART-IS-THE-ID`**`/edit`
6. Open `/js/jt-data.js` in the website files and paste that ID into
   `SHEET_ID`.

Editing any cell in this sheet updates the live site the next time
that page loads — no code, no redeploy, no waiting.

Tutor profiles (rate, description, photo, location) do **not** live
here — tutors manage those themselves after logging in. See Sheet 2.

## Rigid cells — dropdowns instead of free typing

Run this once your content tabs exist:

1. In the same public Sheet: **Extensions → Apps Script**.
2. Add a new file (the **+** next to Files) and paste in the contents
   of `AddContentValidation.gs` from this folder.
3. Pick `addContentValidation` from the function dropdown → **Run**.

Every `Active` cell becomes a dropdown — click and pick, no more
`"yes "` or `"Active"` silently hiding a row. Safe to re-run any time.

## If content "isn't showing up"

Open **`/diagnostics.html`** on your live site (e.g.
`jtedubureau.com/diagnostics.html`) — it checks your Sheet ID, and
tries reading every tab, telling you in plain language what's wrong.
The most common causes, in order of likelihood:

1. **`SHEET_ID` was never actually pasted into `js/jt-data.js`**, or
   the change was made locally but never committed and pushed to
   GitHub — the *live* site is still running the old file.
2. **The Sheet isn't shared publicly.** Share → General access →
   Anyone with the link → Viewer. If this is off, the site receives a
   Google sign-in page instead of your data and silently shows
   placeholder content.
3. **A tab name doesn't match exactly** — a trailing space or the
   wrong case won't be found. Tab names are case-sensitive.
4. **Nothing in that tab is marked `Active = Yes`.**

## Sheet 2 — Private: accounts, requests, leads

1. Create a **second**, separate Google Sheet. Name it
   `JT Education Bureau — Private`. **Never share this one.**
2. Open it, then go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the full contents of
   `Code.gs` from this folder.
4. Add a **second file** in the same script project (the **+** next
   to Files) named `Auth`, and paste in the full contents of
   `Auth.gs`. (Two files, one script project — they share everything
   automatically, nothing extra to wire up.)
5. Click **Deploy → New deployment**.
   - Gear icon next to "Select type" → **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
     (This only allows calling the specific actions the script
     exposes — login, register, submit a request, and so on. It never
     allows opening or reading the Sheet itself; nobody but you can
     do that.)
   - **Deploy**, and authorize the permissions Google asks for (it's
     your own script running under your own account — it'll also ask
     for Drive access, needed for tutor photo uploads).
6. Copy the **Web app URL** (ends in `/exec`) into `APPS_SCRIPT_URL`
   in `/js/jt-data.js`.

Everything else — the `Student Accounts`, `Tutor Accounts`,
`Requests`, `Sessions`, and `Leads - Contact` tabs — is created
automatically the first time each is needed. Nothing to pre-build.

### How passwords are actually stored

Never in plain text. Each password is combined with a random salt and
run through SHA-256 **8,000 times** before being stored — meaningfully
harder to brute-force than a single hash, though it's still a
hand-built system rather than a dedicated auth service. Login attempts
are rate-limited (5 tries, then a 15-minute lockout per phone number).
Session tokens expire after 30 days. This is a reasonable bar for the
bureau's current scale; if the business grows a lot, or starts
handling anything more sensitive than tutoring logistics, that's worth
revisiting with a real auth provider.

### Approving a tutor

New tutor accounts start as unverified and are invisible on the
public directory on purpose. To approve one: open **Tutor Accounts**
in this sheet, find their row, set **Verified** to `Yes`. They appear
on `/tutors.html` on the next page load — no redeploy needed. There's
deliberately no way to self-approve through the site.

### Tutor photos

Uploaded photos (capped at 1MB in both the browser and the script) are
saved to a Drive folder called **"JT Tutor Photos"**, created
automatically in your Drive the first time anyone uploads — nothing
to set up. Each photo is shared as "anyone with the link can view" so
it can display on the public directory, but the folder itself isn't
publicly browsable.

## Updating either script later

Whenever you change `Code.gs` or `Auth.gs`, the live `/exec` URL only
picks up the change if you update the *existing* deployment — a
brand-new deployment gets a different URL and breaks the one already
pasted into `jt-data.js`.

**Deploy → Manage deployments → pencil/edit icon → Version: "New
version" → Deploy.** Same URL, new code.

## A note on scale

Both sheets are well within Google's free quotas at 200–300 students
and 50–60 tutors. Every authenticated action does a linear scan of
the relevant tab, which is instant at this size and would start to
matter somewhere in the tens of thousands of rows — a later, bigger
problem, not something to design around now.
