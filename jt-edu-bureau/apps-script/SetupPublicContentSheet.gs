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
    ["Foundation (8-10)", "Early groundwork for JEE / NEET aspirants.", "Foundation", "Yes"],
    ["CUET", "Common University Entrance Test.", "Competitive", "Yes"],
    ["Olympiads", "Maths, Science and English olympiad prep.", "Foundation", "Yes"]
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

  makeTab(ss, "Tutors", ["Name", "Photo", "Subjects", "Classes", "Boards", "Exams", "Experience", "Qualification", "Locality", "Mode", "Bio", "Rating", "Active"], [
    ["", "", "", "", "", "", "", "", "", "", "", "", "No"]
  ]);

  makeTab(ss, "FAQs", ["Question", "Answer", "Active"], [
    ["How fast will I hear back?", "Most requests get a call from a coordinator within 24 hours with two or three shortlisted tutors to choose from.", "Yes"],
    ["Are tutors actually verified?", "Yes - every tutor is reviewed for identification, qualifications and teaching experience before being listed on the registry.", "Yes"],
    ["What are the fees?", "Fees vary by subject, class and mode. A coordinator will walk you through pricing on your first call, with nothing charged just to browse or submit a request.", "Yes"],
    ["Do you offer online classes?", "Yes. When you submit a request, choose Online or Either as your preferred mode.", "Yes"],
    ["Which areas do you cover for home visits?", "We're based in East of Kailash and actively cover most of Delhi NCR for home-visit tutoring.", "Yes"],
    ["How do I apply to teach?", "Use the Become a tutor form with your subjects, qualifications and experience. Our team calls shortlisted applicants for a short verification chat.", "Yes"],
    ["Can I switch tutors if it's not a good fit?", "Yes - let your coordinator know and they'll arrange another shortlist at no extra charge.", "Yes"],
    ["Is my contact information shared with tutors right away?", "No. Your details stay with your coordinator until you approve a specific match.", "Yes"]
  ]);

  SpreadsheetApp.getUi().alert("Done. Seven content tabs are set up with starter rows you can edit anytime — Subjects, Boards, Exams, Locations, Testimonials, Tutors and FAQs.");
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
