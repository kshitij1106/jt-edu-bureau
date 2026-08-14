/**
 * JT EDUCATION BUREAU — form-to-sheet backend.
 *
 * Paste this into Extensions > Apps Script inside your Google Sheet,
 * then deploy as a Web App (see README.md in this folder for the
 * full step-by-step). This is the only "server" the site needs —
 * no hosting, no billing account, nothing paid.
 */

var SHEET_NAMES = {
  tutor_request: "Leads - Tutor Requests",
  tutor_application: "Leads - Tutor Applications",
  contact: "Leads - Contact"
};

var COLUMNS = {
  tutor_request: ["Timestamp", "Parent/Student Name", "Class", "Phone", "Email", "Board", "Mode", "Subjects", "Locality", "Notes", "Consent", "Status"],
  tutor_application: ["Timestamp", "Full Name", "Phone", "Email", "Experience", "Qualification", "Subjects", "Locality", "Mode", "Notes", "Consent", "Status"],
  contact: ["Timestamp", "Name", "Contact", "Message", "Status"]
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var type = body.type;
    var data = body.data || {};

    if (!SHEET_NAMES[type]) {
      return jsonResponse({ ok: false, reason: "unknown_type" });
    }

    var sheet = getOrCreateSheet(SHEET_NAMES[type], COLUMNS[type]);
    var row = COLUMNS[type].map(function (col) {
      if (col === "Timestamp") return new Date();
      if (col === "Status") return "New";
      return data[col] || "";
    });
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, reason: String(err) });
  }
}

function doGet(e) {
  return jsonResponse({ ok: true, message: "JT Education Bureau form endpoint is live." });
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
