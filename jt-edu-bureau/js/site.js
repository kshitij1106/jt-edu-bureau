/* =========================================================
   JT EDUCATION BUREAU — shared header, footer, nav & widgets
   Single source of truth so the logo/nav/footer are edited
   in one place, not copy-pasted across every HTML page.
   ========================================================= */

const JT_LOGO_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="jtLogoTitleInline">
  <title id="jtLogoTitleInline">JT Education Bureau seal</title>
  <defs><path id="sealTopArcInline" d="M 22,100 A 78,78 0 0,1 178,100" /></defs>
  <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="2.5" />
  <circle cx="100" cy="100" r="89" fill="none" stroke="currentColor" stroke-width="1" />
  <text font-family="'Libre Caslon Text', Georgia, serif" font-size="13.5" letter-spacing="3" fill="currentColor">
    <textPath href="#sealTopArcInline" startOffset="50%" text-anchor="middle">EDUCATION BUREAU</textPath>
  </text>
  <circle cx="73.3" cy="173.3" r="2.4" fill="currentColor" />
  <circle cx="126.7" cy="173.3" r="2.4" fill="currentColor" />
  <rect x="96.5" y="174.5" width="7" height="7" fill="#C1932F" transform="rotate(45 100 178)" />
  <g>
    <rect x="64" y="70" width="72" height="10" rx="2" fill="currentColor" />
    <rect x="68" y="70" width="12" height="66" rx="2" fill="currentColor" />
    <rect x="120" y="70" width="12" height="66" rx="2" fill="currentColor" />
    <path d="M92,71 L92,108 Q92,123 83,125" fill="none" stroke="#C1932F" stroke-width="9" stroke-linecap="round" />
  </g>
</svg>`;

const JT_NAV_LINKS = [
  { href: "find-a-tutor.html", label: "Find a tutor" },
  { href: "become-a-tutor.html", label: "Become a tutor" },
  { href: "subjects.html", label: "Subjects" },
  { href: "locations.html", label: "Locations" },
  { href: "how-it-works.html", label: "How JT works" },
  { href: "about.html", label: "About" }
];

function jtRenderHeader(activePage) {
  const mount = document.getElementById("site-header-mount");
  if (!mount) return;
  const navHtml = JT_NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${activePage === l.href ? "active" : ""}">${l.label}</a>`
  ).join("");

  mount.innerHTML = `
  <header class="site-header" id="siteHeader">
    <div class="container header-row">
      <a href="index.html" class="brand">
        <span class="brand-mark" style="color:#16233F">${JT_LOGO_SVG}</span>
        <span class="brand-name">JT Education Bureau<small>Delhi&nbsp;NCR &middot; est. tutoring registry</small></span>
      </a>
      <nav class="main-nav" aria-label="Primary">${navHtml}</nav>
      <div class="header-cta">
        <a href="find-a-tutor.html" class="btn btn-outline">Find a tutor</a>
        <a href="tel:+918076064782" class="btn btn-primary">Call us</a>
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
            <span class="brand-mark" style="color:#FBF8F1">${JT_LOGO_SVG}</span>
            <strong style="font-family:var(--font-display); font-size:1.05rem;">JT Education Bureau</strong>
          </div>
          <p>A tutor registry connecting students and verified tutors across Delhi&nbsp;NCR, for school subjects, boards and competitive exams.</p>
        </div>
        <div>
          <h5>Bureau</h5>
          <ul>
            <li><a href="find-a-tutor.html">Find a tutor</a></li>
            <li><a href="become-a-tutor.html">Become a tutor</a></li>
            <li><a href="how-it-works.html">How JT works</a></li>
            <li><a href="about.html">About us</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h5>Explore</h5>
          <ul>
            <li><a href="subjects.html">Subjects</a></li>
            <li><a href="boards.html">Boards</a></li>
            <li><a href="exams.html">Competitive exams</a></li>
            <li><a href="locations.html">Locations</a></li>
            <li><a href="faqs.html">FAQs</a></li>
          </ul>
        </div>
        <div>
          <h5>Registry office</h5>
          <ul>
            <li>145, Sant Nagar<br>East of Kailash<br>New&nbsp;Delhi&nbsp;110065</li>
            <li><a href="mailto:classesjt@gmail.com">classesjt@gmail.com</a></li>
            <li><a href="tel:+918076064782">+91&nbsp;80760&nbsp;64782</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${year} JT Education Bureau Private Limited</span>
        <span>Registered office: New Delhi, India</span>
      </div>
    </div>
  </footer>`;
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
