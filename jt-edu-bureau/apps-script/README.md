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
free quotas at 200–300 students and 50–60 tutors. If the business
outgrows a spreadsheet as its live "database" — lots of simultaneous
staff editing it, or you want tutors/students logging into real
accounts — that's the point where moving to a proper database (see
the main README's "Phase 2") starts to pay for itself.
