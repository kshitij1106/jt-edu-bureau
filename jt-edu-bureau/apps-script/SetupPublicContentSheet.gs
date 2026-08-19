/**
 * JT EDUCATION BUREAU — one-time setup for the PUBLIC content Sheet.
 *
 * Use this in the sheet you're about to SHARE PUBLICLY (Sheet 1 in
 * apps-script/README.md) — never in the private leads sheet.
 *
 * HOW TO RUN:
 * 1. Create a new, blank Google Sheet.
 * 2. Extensions > Apps Script, delete the placeholder code, paste
 *    this whole file in.
 * 3. In the toolbar dropdown (next to the bug icon) choose the
 *    function "setupPublicContentSheet", then click Run.
 * 4. The first run asks you to authorize — that's normal, it's your
 *    own script running on your own sheet. Approve it.
 * 5. Switch back to the Sheet tab — six tabs now exist, each with
 *    headers and a few real starter rows you can edit or add to.
 * 6. Delete the default "Sheet1" tab if you like (right-click it).
 * 7. Then follow the "Share" and "copy the Sheet ID" steps in
 *    apps-script/README.md.
 *
 * Safe to re-run: it never deletes or duplicates a tab that already
 * exists, so running it twice by accident does nothing harmful.
 */

function setupPublicContentSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  makeTab(ss, "Site Settings", ["Key", "Value"], [
    ["Tagline", "Building Minds, Shaping Futures."],
    ["HeroHeadline", "Every tutor on our registry is checked before a class is booked."],
    ["HeroSubtext", "Create a free account, browse verified tutors, and connect directly with the ones that fit."],
    ["LogoURL", ""],
    ["Phone", "+91 80760 64782"],
    ["Email", "classesjt@gmail.com"],
    ["Address", "145, Sant Nagar, East of Kailash, New Delhi 110065"]
  ]);

  makeTab(ss, "Subjects", ["Name", "Description", "Tag", "Active"], [
    ["Mathematics", "Classes 1-12, all major boards.", "Core", "Yes"],
    ["Science", "Physics, Chemistry, Biology combined, Classes 1-10.", "Core", "Yes"],
    ["Physics", "Classes 9-12, board and foundation.", "Senior", "Yes"],
    ["Chemistry", "Classes 9-12, board and foundation.", "Senior", "Yes"],
    ["Biology", "Classes 9-12, board and NEET foundation.", "Senior", "Yes"],
    ["English", "Grammar, writing and literature.", "Core", "Yes"],
    ["Hindi", "Grammar, comprehension and writing.", "Core", "Yes"],
    ["Social Science", "History, Civics, Geography, Economics.", "Core", "Yes"],
    ["Computer Science", "Coding fundamentals to board exams.", "Senior", "Yes"],
    ["Accountancy", "Classes 11-12, Commerce stream.", "Commerce", "Yes"],
    ["Economics", "Classes 11-12, all boards.", "Commerce", "Yes"],
    ["Business Studies", "Classes 11-12, Commerce stream.", "Commerce", "Yes"]
  ]);

  makeTab(ss, "Boards", ["Name", "Description", "Tag", "Active"], [
    ["CBSE", "Central Board of Secondary Education, all classes.", "Most requested", "Yes"],
    ["ICSE / ISC", "Council for the Indian School Certificate Examinations.", "", "Yes"],
    ["IB", "International Baccalaureate, PYP, MYP and DP.", "", "Yes"],
    ["State boards", "Delhi, Haryana and UP state curricula.", "", "Yes"],
    ["NIOS", "National Institute of Open Schooling.", "", "Yes"]
  ]);

  makeTab(ss, "Exams", ["Name", "Description", "Tag", "Active"], [
    ["JEE Main & Advanced", "Engineering entrance, Classes 11-12 and droppers.", "Competitive", "Yes"],
    ["NEET", "Medical entrance, Classes 11-12 and droppers.", "Competitive", "Yes"],
    ["BITSAT", "Undergraduate admissions, BITS Pilani.", "Competitive", "Yes"],
    ["CUET", "Common University Entrance Test.", "Competitive", "Yes"],
    ["Olympiads", "Maths, Science and English olympiad prep.", "Foundation", "Yes"],
    ["NDA", "Defence entrance for Army, Navy and Air Force.", "Competitive", "Yes"],
    ["SAT", "Undergraduate admissions test, India and abroad.", "Study abroad", "Yes"],
    ["Foundation (8-10)", "Early groundwork for JEE / NEET aspirants.", "Foundation", "Yes"]
  ]);

  makeTab(ss, "Locations", ["Name", "Description", "Tag", "Active"], [
    ["South Delhi", "East of Kailash, Lajpat Nagar, Greater Kailash, Saket and nearby.", "Home visits", "Yes"],
    ["Central Delhi", "Karol Bagh, Connaught Place and nearby.", "Home visits", "Yes"],
    ["East Delhi", "Preet Vihar, Mayur Vihar and nearby.", "Home visits", "Yes"],
    ["West Delhi", "Rajouri Garden, Janakpuri and nearby.", "Home visits", "Yes"],
    ["Gurugram", "Select sectors, ask your coordinator.", "Home visits", "Yes"],
    ["Noida", "Select sectors, ask your coordinator.", "Home visits", "Yes"],
    ["Online, anywhere", "Live online classes, no locality restriction.", "Online", "Yes"]
  ]);

  makeTab(ss, "Testimonials", ["Name", "Role", "Quote", "Rating", "Active"], [
    ["", "", "", "", "No"]
  ]);

  makeTab(ss, "FAQs", ["Question", "Answer", "Active"], [
    ["How fast will I hear back?", "Once you mark interest in a tutor, they can see your details in their dashboard and typically follow up within a day or two.", "Yes"],
    ["Are tutors actually verified?", "Yes - every tutor is reviewed for identification, qualifications and teaching experience before being listed on the registry.", "Yes"],
    ["What are the fees?", "Rates vary by tutor and are shown on each tutor's profile. There's no charge to browse, register, or mark interest.", "Yes"],
    ["Do you offer online classes?", "Yes - filter the tutor directory by mode to see tutors offering online classes.", "Yes"],
    ["Which areas do you cover for home visits?", "We're based in East of Kailash and actively cover most of Delhi NCR for home-visit tutoring.", "Yes"],
    ["How do I apply to teach?", "Create a tutor account and fill in your subjects, qualifications and experience. A coordinator reviews it before your profile appears on the public directory.", "Yes"],
    ["Can I switch tutors if it's not a good fit?", "Yes - let your coordinator know and they'll arrange another shortlist at no extra charge.", "Yes"],
    ["Is my contact information shared with tutors right away?", "Only once you mark interest in a specific tutor - your basic details go to that tutor so they can follow up.", "Yes"]
  ]);

  SpreadsheetApp.getUi().alert("Done. Seven tabs are set up with starter rows you can edit anytime — Site Settings, Subjects, Boards, Exams, Locations, Testimonials and FAQs.");
}

function makeTab(ss, name, headers, rows) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return; // never overwrite an existing tab
  sheet = ss.insertSheet(name);
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
  rows.forEach(function (r) {
    if (r.join("")) sheet.appendRow(r);
  });
  sheet.autoResizeColumns(1, headers.length);
}
