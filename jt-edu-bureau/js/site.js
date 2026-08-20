/* =========================================================
   JT EDUCATION BUREAU — shared header, footer, nav & widgets
   Single source of truth so the logo/nav/footer are edited
   in one place, not copy-pasted across every HTML page.
   ========================================================= */

const JT_LOGO_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="jtLogoTitleInline">
  <title id="jtLogoTitleInline">JT Education Bureau</title>
  <rect x="3" y="3" width="94" height="94" rx="16" fill="none" stroke="currentColor" stroke-width="2.5"/>
  <rect x="11" y="11" width="78" height="78" rx="11" fill="none" stroke="#C1932F" stroke-width="1.4"/>
  <text x="50" y="64" font-family="'Libre Caslon Text', Georgia, serif" font-size="36" text-anchor="middle" fill="currentColor" font-weight="600">JT</text>
</svg>`;

const JT_NAV_LINKS = [
  { href: "find-a-tutor.html", label: "Find a tutor" },
  { href: "tutors.html", label: "Browse tutors" },
  { href: "become-a-tutor.html", label: "Become a tutor" },
  { href: "about.html", label: "About" }
];

function jtRenderHeader(activePage) {
  const mount = document.getElementById("site-header-mount");
  if (!mount) return;
  const navHtml = JT_NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${activePage === l.href ? "active" : ""}">${l.label}</a>`
  ).join("");

  const session = jtGetSession();
  const quickLink = session && session.role === "student" ? "student-dashboard.html"
                   : session && session.role === "tutor" ? "tutor-dashboard.html"
                   : "find-a-tutor.html";
  const quickLabel = session ? "My account" : "Find a tutor";

  mount.innerHTML = `
  <header class="site-header" id="siteHeader">
    <div class="container header-row">
      <a href="index.html" class="brand">
        <span class="brand-mark" id="headerLogoMark" style="color:#16233F">${JT_LOGO_SVG}</span>
        <span class="brand-name">JT Education Bureau<small id="headerTagline">Building&nbsp;Minds,&nbsp;Shaping&nbsp;Futures.</small></span>
      </a>
      <nav class="main-nav" aria-label="Primary">${navHtml}</nav>
      <div class="header-cta">
        <a href="${quickLink}" class="btn btn-outline">${quickLabel}</a>
        <a href="tel:+918076064782" class="btn btn-primary" id="headerCallLink">Call us</a>
        <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </header>`;

  const toggle = document.getElementById("navToggle");
  const header = document.getElementById("siteHeader");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  jtApplySettings();
}

function jtRenderFooter() {
  const mount = document.getElementById("site-footer-mount");
  if (!mount) return;
  const year = new Date().getFullYear();
  mount.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <span class="brand-mark" id="footerLogoMark" style="color:#FBF8F1">${JT_LOGO_SVG}</span>
            <strong style="font-family:var(--font-display); font-size:1.05rem;">JT Education Bureau</strong>
          </div>
          <p>A tutor registry connecting students and verified tutors across India</p>
        </div>
        <div>
          <h5>Bureau</h5>
          <ul>
            <li><a href="find-a-tutor.html">Find a tutor</a></li>
            <li><a href="become-a-tutor.html">Become a tutor</a></li>
            <li><a href="tutors.html">Browse tutors</a></li>
            <li><a href="about.html">About us</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h5>Registry office</h5>
          <ul>
            <li id="footerAddress">145, Sant Nagar<br>East of Kailash<br>New&nbsp;Delhi&nbsp;110065</li>
            <li><a href="mailto:classesjt@gmail.com" id="footerEmailLink">classesjt@gmail.com</a></li>
            <li><a href="tel:+918076064782" id="footerPhoneLink">+91&nbsp;80760&nbsp;64782</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${year} JT Education Network Pvt Ltd</span>
        <span>Registered office: New Delhi, India</span>
      </div>
    </div>
  </footer>`;
  jtApplySettings();
}

/**
 * Progressive enhancement: header/footer already rendered with sane
 * hardcoded defaults above, so the page never looks broken. This
 * patches in values from the "Site Settings" sheet tab where set,
 * without blocking the initial render.
 */
async function jtApplySettings() {
  const settings = await jtGetSettings();
  if (!settings || !Object.keys(settings).length) return;

  if (settings.Tagline) {
    document.querySelectorAll("#headerTagline").forEach(el => el.textContent = settings.Tagline);
  }
  if (settings.LogoURL) {
    const imgHtml = `<img src="${jtNormalizeImageUrl(settings.LogoURL)}" alt="JT Education Bureau" style="width:100%; height:100%; object-fit:contain;">`;
    document.querySelectorAll("#headerLogoMark, #footerLogoMark").forEach(el => el.innerHTML = imgHtml);
  }
  if (settings.Phone) {
    const telHref = "tel:+91" + settings.Phone.replace(/\D/g, "").slice(-10);
    document.querySelectorAll("#headerCallLink, #footerPhoneLink").forEach(el => { el.href = telHref; });
    const phoneLink = document.getElementById("footerPhoneLink");
    if (phoneLink) phoneLink.textContent = settings.Phone;
  }
  if (settings.Email) {
    const emailLink = document.getElementById("footerEmailLink");
    if (emailLink) { emailLink.href = "mailto:" + settings.Email; emailLink.textContent = settings.Email; }
  }
  if (settings.Address) {
    const addr = document.getElementById("footerAddress");
    if (addr) addr.innerHTML = settings.Address.split(",").map(s => s.trim()).join("<br>");
  }
}

/* ---------- FAQ accordion (used on any page with .faq-item) ---------- */
function jtInitFaq() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => item.classList.toggle("open"));
  });
}

/* ---------- Generic form validation + submit wiring ---------- */
function jtSetupForm(formEl, type, opts = {}) {
  if (!formEl) return;
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    formEl.querySelectorAll("[required]").forEach(input => {
      const field = input.closest(".field");
      if (!field) return;
      const filled = input.type === "checkbox" ? input.checked : input.value.trim().length > 0;
      field.classList.toggle("invalid", !filled);
      if (!filled) valid = false;
    });
    if (!valid) return;

    // honeypot anti-spam: a hidden field real users never fill
    const honeypot = formEl.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) return;

    const submitBtn = formEl.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submitting…"; }

    const data = {};
    new FormData(formEl).forEach((v, k) => { if (k !== "website") data[k] = v; });

    await jtSubmitForm(type, data);

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    formEl.style.display = "none";
    const success = document.getElementById(opts.successId || "formSuccess");
    if (success) success.classList.add("show");
  });

  formEl.querySelectorAll("[required]").forEach(input => {
    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field) field.classList.remove("invalid");
    });
  });
}
