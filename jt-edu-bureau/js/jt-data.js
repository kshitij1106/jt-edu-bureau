/* =========================================================
   JT EDUCATION BUREAU — data layer
   Reads content from a PUBLIC Google Sheet (no backend, no
   build step). Writes lead/application forms to a SEPARATE
   PRIVATE Sheet via a free Apps Script Web App endpoint.

   Two different sheets on purpose — see /apps-script/README.md.
   The public one only ever holds Subjects/Boards/Exams/
   Locations/Testimonials/FAQs. Anyone visiting the site can
   view its raw ID and contents, so names/phone numbers/emails
   must never live there. The private one holds every form
   submission and is never shared — the Apps Script writes to
   it on the owner's behalf without visitors ever touching it.
   ========================================================= */

const JT_CONFIG = {
  // ID of the PUBLIC content Sheet (shared "Anyone with the link – Viewer").
  // From its URL, the long string between /d/ and /edit.
  SHEET_ID: "PASTE_YOUR_PUBLIC_SHEET_ID_HERE",

  // The /exec URL from deploying Code.gs as a Web App INSIDE THE
  // PRIVATE leads Sheet (that sheet itself stays un-shared).
  APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",

  // Tab names — keep these exact names in your Sheet, or edit to match
  TABS: {
    subjects: "Subjects",
    boards: "Boards",
    exams: "Exams",
    locations: "Locations",
    testimonials: "Testimonials",
    faqs: "FAQs"
  }
};

/* ---------- CSV fetch + parse (public sheet, no API key) ---------- */

function jtSheetUrl(tabName) {
  // cache-bust so browsers/proxies never serve a stale copy of your Sheet
  return `https://docs.google.com/spreadsheets/d/${JT_CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&_=${Date.now()}`;
}

function jtParseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(c => c && c.trim().length))
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = (r[idx] || "").trim());
      return obj;
    });
}

/**
 * Fetches a tab from the public Sheet as an array of row objects.
 * Falls back to `fallback` (an array) if the Sheet isn't configured
 * yet or the request fails, so pages never look broken mid-setup.
 */
async function jtFetchTab(tabKey, fallback = []) {
  const tabName = JT_CONFIG.TABS[tabKey];
  if (!JT_CONFIG.SHEET_ID || JT_CONFIG.SHEET_ID.startsWith("PASTE_")) {
    return fallback;
  }
  try {
    const res = await fetch(jtSheetUrl(tabName));
    if (!res.ok) throw new Error("Sheet fetch failed: " + res.status);
    const rows = jtParseCsv(await res.text());
    const active = rows.filter(r => (r.Active || r.active || "y").toLowerCase().startsWith("y") || !("Active" in r));
    return active.length ? active : fallback;
  } catch (err) {
    console.warn(`[JT] Could not load "${tabName}" tab, showing placeholder content.`, err);
    return fallback;
  }
}

/* ---------- Submitting forms back to the Sheet ---------- */

/**
 * Posts a lead/application form to the Apps Script Web App, which
 * appends a row to the matching tab in the same Sheet.
 * type: "tutor_request" | "tutor_application" | "contact"
 */
async function jtSubmitForm(type, data) {
  if (!JT_CONFIG.APPS_SCRIPT_URL || JT_CONFIG.APPS_SCRIPT_URL.startsWith("PASTE_")) {
    console.warn("[JT] Apps Script URL not configured yet — form not submitted.", { type, data });
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(JT_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type, data, submittedAt: new Date().toISOString() })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("[JT] Form submit failed", err);
    return { ok: false, reason: "network" };
  }
}

/* ---------- Image URLs: auto-fix the most common paste mistake ---------- */

/**
 * Google Drive's own "Share" link (…/file/d/ID/view) doesn't work as
 * an <img src> — it's a viewer page, not the image itself. This
 * rewrites that pattern to a URL that actually loads inline, so a
 * tutor's photo works even if the share link was pasted as-is.
 */
function jtNormalizeImageUrl(url) {
  if (!url) return url;
  url = url.trim();
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}

/* ---------- Live registry counts (aggregate only, no PII) ---------- */

/**
 * Calls the private Apps Script endpoint for aggregate counts only
 * (how many rows in each Leads tab) — never the row contents. Returns
 * null if not configured or unreachable, so callers can hide the
 * stat rather than show a wrong number.
 */
async function jtFetchLeadStats() {
  if (!JT_CONFIG.APPS_SCRIPT_URL || JT_CONFIG.APPS_SCRIPT_URL.startsWith("PASTE_")) return null;
  try {
    const res = await fetch(`${JT_CONFIG.APPS_SCRIPT_URL}?stats=1`);
    const json = await res.json();
    return json.ok ? json : null;
  } catch (err) {
    console.warn("[JT] Could not load live stats.", err);
    return null;
  }
}

/* ---------- Remember this visitor's own details on this device ---------- */
/* Not an account — just a same-browser convenience so a returning
   student or tutor doesn't retype their details. Nothing here is
   sent anywhere or visible to anyone but them. */

function jtSaveLocalProfile(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (err) { /* ignore (e.g. private browsing) */ }
}

function jtLoadLocalProfile(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (err) { return null; }
}

function jtPrefillForm(formEl, data) {
  if (!formEl || !data) return false;
  let filled = false;
  Object.entries(data).forEach(([name, value]) => {
    const field = formEl.querySelector(`[name="${CSS.escape(name)}"]`);
    if (field && !field.value) { field.value = value; filled = true; }
  });
  return filled;
}

/* ---------- Auth API (talks to Auth.gs on the private sheet) ---------- */

async function jtApiCall(action, extra) {
  if (!JT_CONFIG.APPS_SCRIPT_URL || JT_CONFIG.APPS_SCRIPT_URL.startsWith("PASTE_")) {
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(JT_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ action }, extra))
    });
    return await res.json();
  } catch (err) {
    return { ok: false, reason: "network" };
  }
}

const JT_SESSION_KEY = "jt_session";

function jtSaveSession(token, role) {
  localStorage.setItem(JT_SESSION_KEY, JSON.stringify({ token, role }));
}
function jtGetSession() {
  try { return JSON.parse(localStorage.getItem(JT_SESSION_KEY) || "null"); } catch (e) { return null; }
}
function jtClearSession() {
  localStorage.removeItem(JT_SESSION_KEY);
}

/**
 * Call at the top of any dashboard page. Redirects to the right
 * login page if there's no session, or if the session is for the
 * wrong role (e.g. a tutor token on the student dashboard).
 */
async function jtRequireAuth(expectedRole, loginPage) {
  const session = jtGetSession();
  if (!session || session.role !== expectedRole) {
    location.href = loginPage;
    return null;
  }
  const res = await jtApiCall("getProfile", { token: session.token });
  if (!res.ok) {
    jtClearSession();
    location.href = loginPage;
    return null;
  }
  return { token: session.token, profile: res.profile };
}

/* ---------- Small render helpers shared across pages ---------- */

function jtIndexCard({ name, description, tag }, href) {
  const a = document.createElement("a");
  a.className = "index-card";
  a.href = href || "#";
  a.innerHTML = `
    ${tag ? `<span class="tag">${tag}</span>` : ""}
    <h4>${name}</h4>
    <p>${description || ""}</p>`;
  return a;
}

function jtMountCards(mountEl, rows, fields, hrefBuilder) {
  mountEl.innerHTML = "";
  rows.forEach(r => {
    mountEl.appendChild(jtIndexCard({
      name: r[fields.name],
      description: r[fields.description],
      tag: fields.tag ? r[fields.tag] : null
    }, hrefBuilder ? hrefBuilder(r) : null));
  });
}
