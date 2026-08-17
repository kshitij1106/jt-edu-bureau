/**
 * JT EDUCATION BUREAU — backend entry points.
 * Paste this + Auth.gs into the PRIVATE sheet's Apps Script project.
 * See README.md in this folder for full setup.
 */

var CONTACT_COLUMNS = ["Timestamp", "Name", "Contact", "Message", "Status"];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    switch (body.action) {
      case "contact": return handleContact(body.data || {});
      case "register": return handleRegister(body);
      case "login": return handleLogin(body);
      case "logout": return handleLogout(body);
      case "getProfile": return handleGetProfile(body);
      case "updateProfile": return handleUpdateProfile(body);
      case "markInterested": return handleMarkInterested(body);
      case "getMyInterests": return handleGetMyInterests(body);
      case "getTutorInterests": return handleGetTutorInterests(body);
      case "uploadPhoto": return handleUploadPhoto(body);
      default: return jsonResponse({ ok: false, reason: "unknown_action" });
    }
  } catch (err) {
    return jsonResponse({ ok: false, reason: String(err) });
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.stats) return jsonResponse(getStats());
  if (p.listTutors) return jsonResponse({ ok: true, tutors: getPublicTutors() });
  return jsonResponse({ ok: true, message: "JT Education Bureau API is live." });
}

function handleContact(data) {
  var sheet = getOrCreateSheet("Contact Messages", CONTACT_COLUMNS);
  sheet.appendRow([new Date(), data.Name || "", data.Contact || "", data.Message || "", "New"]);
  return jsonResponse({ ok: true });
}

/** Aggregate counts only — never row contents. Safe to expose publicly. */
function getStats() {
  var tutorSheet = getAccountSheet("tutor");
  var studentSheet = getAccountSheet("student");
  var interestsSheet = getOrCreateSheet("Interests", INTEREST_COLUMNS);

  var tutorData = tutorSheet.getDataRange().getValues();
  var verifiedIdx = tutorData[0].indexOf("Verified");
  var verifiedCount = 0;
  for (var i = 1; i < tutorData.length; i++) {
    if (String(tutorData[i][verifiedIdx]).toLowerCase() === "yes") verifiedCount++;
  }

  return {
    ok: true,
    verifiedTutors: verifiedCount,
    registeredStudents: Math.max(studentSheet.getLastRow() - 1, 0),
    totalInterests: Math.max(interestsSheet.getLastRow() - 1, 0)
  };
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
