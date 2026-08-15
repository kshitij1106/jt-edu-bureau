/**
 * JT EDUCATION BUREAU — "rigid cells" for the public content Sheet.
 *
 * Adds dropdown validation to the cells most likely to break the
 * website if mistyped (Active, Mode, Locality), and a new "Options"
 * tab holding the allowed values — so you can extend the list
 * (e.g. add a new region) just by adding a row there, with no code
 * changes and no re-running this script.
 *
 * Run this in the PUBLIC content sheet, any time after
 * SetupPublicContentSheet.gs. Safe to re-run.
 */

function addContentValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var options = ensureOptionsTab(ss);

  var yesNo = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", "No"], true)
    .setAllowInvalid(false)
    .build();

  var modeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Home visit", "Online", "Either"], true)
    .setAllowInvalid(false)
    .build();

  // Regions are extensible: this points at a 200-row range in Options,
  // so adding a new region there is picked up with no script re-run.
  var regionRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(options.getRange("A2:A200"), true)
    .setAllowInvalid(true) // warns rather than hard-blocks, in case you need a brand-new region right away
    .build();

  ["Subjects", "Boards", "Exams", "Locations", "Testimonials", "Tutors", "FAQs"].forEach(function (tab) {
    applyValidation(ss, tab, "Active", yesNo);
  });
  applyValidation(ss, "Tutors", "Mode", modeRule);
  applyValidation(ss, "Tutors", "Locality", regionRule);

  SpreadsheetApp.getUi().alert(
    "Done. Active/Mode/Locality cells now show dropdowns instead of free text. " +
    "To add a new region later, just add a row to the Options tab — no need to run this again."
  );
}

function ensureOptionsTab(ss) {
  var sheet = ss.getSheetByName("Options");
  if (sheet) return sheet;

  sheet = ss.insertSheet("Options");

  sheet.getRange("A1").setValue("Regions — add a row any time, Locality dropdowns update automatically");
  sheet.getRange("A1").setFontWeight("bold");
  var regions = ["South Delhi", "Central Delhi", "East Delhi", "West Delhi", "North Delhi", "Gurugram", "Noida", "Online, anywhere"];
  sheet.getRange(2, 1, regions.length, 1).setValues(regions.map(function (r) { return [r]; }));

  sheet.getRange("C1").setValue("Subjects — reference spelling; copy into the Subjects column, comma-separated");
  sheet.getRange("C1").setFontWeight("bold");
  var subjects = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "Computer Science", "Accountancy", "Economics", "Business Studies"];
  sheet.getRange(2, 3, subjects.length, 1).setValues(subjects.map(function (s) { return [s]; }));

  sheet.autoResizeColumns(1, 3);
  return sheet;
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
