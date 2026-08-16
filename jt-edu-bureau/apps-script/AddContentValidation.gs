/**
 * JT EDUCATION BUREAU — "rigid cells" for the public content Sheet.
 *
 * Adds a Yes/No dropdown to every Active column, so a typo like
 * "yes " or "Active" can't silently hide a row from the site.
 *
 * Run this in the PUBLIC content sheet, any time after
 * SetupPublicContentSheet.gs. Safe to re-run.
 *
 * (Tutor profiles — rate, description, photo, location — now live
 * in the private Tutor Accounts sheet and are edited by tutors
 * themselves at /tutor-dashboard.html, not here.)
 */

function addContentValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var yesNo = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", "No"], true)
    .setAllowInvalid(false)
    .build();

  ["Subjects", "Boards", "Exams", "Locations", "Testimonials", "FAQs"].forEach(function (tab) {
    applyValidation(ss, tab, "Active", yesNo);
  });

  SpreadsheetApp.getUi().alert("Done. Every Active cell now shows a Yes/No dropdown instead of free text.");
}

function applyValidation(ss, tabName, columnName, rule) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return;
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var colIndex = headers.indexOf(columnName) + 1;
  if (colIndex === 0) return; // this tab doesn't have that column, skip quietly
  var numRows = Math.max(sheet.getMaxRows() - 1, 200);
  sheet.getRange(2, colIndex, numRows, 1).setDataValidation(rule);
}
