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
    faqs: "FAQs",
    tutors: "Tutors"
  }
};

/* ---------- CSV fetch + parse (public sheet, no API key) ---------- */

function jtSheetUrl(tabName) {
  return `https://docs.google.com/spreadsheets/d/${JT_CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
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
