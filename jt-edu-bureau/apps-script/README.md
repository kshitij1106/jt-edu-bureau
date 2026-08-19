# Setup — two sheets, that's it

**Sheet 1 (public):** what the site *says* — text, subjects, logo.
**Sheet 2 (private):** accounts, passwords, who's interested in whom.
Never shared, never touched except the two things noted below.

## Sheet 1 — Public Content

1. New blank Google Sheet → **Extensions → Apps Script** → paste in
   `SetupPublicContentSheet.gs` → run `setupPublicContentSheet`.
2. Seven tabs appear, pre-filled. **Site Settings** is the one to
   bookmark — hero text, tagline, logo, phone, email, address, all
   in one place, reflected across the whole site.
3. **Share → Anyone with the link → Viewer.** (No personal data ever
   lives here, so this is safe.)
4. Copy the Sheet ID from its URL → paste into `SHEET_ID` in
   `/js/jt-data.js`.
5. Optional: add a second file `AddContentValidation`, paste
   `AddContentValidation.gs`, run `addContentValidation` — turns
   every `Active` cell into a Yes/No dropdown.

## Sheet 2 — Private

1. **Second, separate** blank Sheet. **Never share it.**
2. **Extensions → Apps Script** → paste `Code.gs`.
3. Add a second file named `Auth` → paste `Auth.gs`.
4. **Deploy → New deployment → Web app** → Execute as **Me** → Who
   has access **Anyone** → **Deploy** → approve the permissions it
   asks for.
5. Copy the `/exec` URL → paste into `APPS_SCRIPT_URL` in
   `/js/jt-data.js`.

Everything else — **Students**, **Tutors**, **Interests**,
**Sessions** — is created automatically the first time it's needed.
Nothing to pre-build.

## The two things you'll actually touch here

**Approve a tutor:** open **Tutors**, find their row, set `Verified`
to `Yes`. Live on the public directory on the next page load. Run
`addVerifiedDropdown` once (from `Auth.gs`, function dropdown → Run)
to make that a click instead of typing.

**Reset someone's password:** find their row in **Students** or
**Tutors**, type a new password into the **Reset Password** column,
hit Enter. It's hashed and the cell clears itself automatically —
nothing to run, nothing to deploy. (Passwords are never stored in
plain text, including here — this column is a write-only "set it"
box, not a "read it" box.)

## Updating the scripts later

Editing `Code.gs`/`Auth.gs` doesn't update the live URL by itself —
you have to redeploy the *same* deployment, not create a new one:

**Deploy → Manage deployments → pencil icon → Version: "New
version" → Deploy.**

## If content isn't showing up

Open `/diagnostics.html` on your live site — checks Sheet 1's
connection tab-by-tab in plain language. Usually one of: `SHEET_ID`
never got pushed live, the Sheet isn't shared as Viewer, a tab name
has a typo, or nothing's marked `Active = Yes`.
