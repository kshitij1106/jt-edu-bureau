# Setting up your content & leads Sheets

You need **two** Google Sheets. This is deliberate, not extra work for
no reason — one is public (so the website can read it with no login),
and one is private (so nobody's phone number ever sits somewhere the
whole internet can technically reach). Both are still 100% free.

## Sheet 1 — Public content (the site reads this)

**Fastest way — run the setup script:**

1. Create a new, blank Google Sheet.
2. **Extensions → Apps Script**, delete the placeholder code, paste in
   the full contents of `SetupPublicContentSheet.gs` from this folder.
3. In the toolbar, pick the function `setupPublicContentSheet` from
   the dropdown and click **Run**. Approve the permissions it asks
   for (it's your own script on your own sheet).
4. Switch back to the Sheet — seven tabs now exist with headers and
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
   | `Tutors` | `Name`, `Photo`, `Subjects`, `Classes`, `Boards`, `Exams`, `Experience`, `Qualification`, `Locality`, `Mode`, `Bio`, `Rating`, `Active` |
   | `FAQs` | `Question`, `Answer`, `Active` |

   For `Tutors`: `Subjects` is comma-separated (e.g. `Mathematics,
   Physics`), `Photo` is an optional public image URL (leave blank for
   a plain initials avatar), `Locality` should match a name from your
   `Locations` tab so the region filter lines up, and `Mode` should be
   exactly `Home visit`, `Online`, or `Either`.

   **Only ever put here what's safe for anyone on the internet to
   see** — a name, subjects, qualifications, a short bio, an
   approximate region. Never a phone number, email, or exact address;
   those stay in tutors' private applications (Sheet 2 below), and
   only a coordinator sees them.

   Set `Active` to `Yes` on any row you want visible on the site — leave
   it blank or set `No` to hide a row without deleting it (handy for
   drafting something before it goes live).

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

## Rigid cells — dropdowns instead of free typing

Run this once your content tabs exist (from either method above):

1. In the same public Sheet: **Extensions → Apps Script**.
2. Add a new file (the **+** next to Files) and paste in the contents
   of `AddContentValidation.gs` from this folder.
3. Pick `addContentValidation` from the function dropdown → **Run**.

This does two things:

- Turns every `Active` cell, `Tutors!Mode`, and `Tutors!Locality` into
  a **dropdown** — you click and pick, you can't mistype `"yes "` or
  `"Home Visit"` in a way the site won't recognize.
- Creates an **Options** tab with the allowed regions and a reference
  spelling list for subjects. **To add a new region, just add a row to
  the Options tab** — every Locality dropdown updates immediately, no
  script, no redeploy. Subjects stay free-typed (a tutor can teach
  several, comma-separated) but the Options tab gives you consistent
  spelling to copy from.

Safe to re-run any time — it won't duplicate the Options tab or wipe
existing dropdown choices.

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
3. **A tab name doesn't match exactly** — `Tutors ` (trailing space)
   or `tutors` (wrong case) won't be found. Tab names are
   case-sensitive.
4. **Nothing in that tab is marked `Active = Yes`** — rows without it
   are hidden on purpose (so you can draft content before publishing).

## Sheet 2 — Private leads (form submissions land here)

1. Create a **second**, separate Google Sheet. Name it
   `JT Education Bureau — Leads (Private)`. **Do not share this one.**
2. Open it, then go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the full contents of
   `Code.gs` from this folder.
4. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" → choose **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
     (This sounds alarming, but it only allows *submitting a form* —
     it never allows reading the sheet. Nobody but you can open the
     Sheet itself.)
   - Click **Deploy**, and authorize the permissions Google asks for
     (it's your own script running under your own account).
5. Copy the **Web app URL** it gives you (ends in `/exec`).
6. Open `/js/jt-data.js` in the website files and paste that URL into
   `APPS_SCRIPT_URL`.

The first time each form is submitted, the script automatically
creates the matching tab (`Leads - Tutor Requests`, `Leads - Tutor
Applications`, `Leads - Contact`) with headers already in place — you
don't need to pre-build these tabs yourself.

## A note on scale

Both the public read and the private write are well within Google's
free quotas at 200–300 students and 50–60 tutors. A spreadsheet is a
perfectly good "database" for content and leads at this size — the
point where it stops being enough is a much later, much bigger
problem (payments, real-time multi-user editing at large scale), not
something to design around now.
