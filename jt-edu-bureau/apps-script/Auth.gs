/**
 * JT EDUCATION BUREAU — accounts, sessions, profiles, tutor
 * interest, and photo upload. Phone + password, stored only as a
 * salted, stretched hash — never plaintext, not even for the sheet
 * owner. See the "Reset Password" column instead (bottom of file)
 * for how you set/change someone's password directly.
 */

var STUDENT_COLUMNS = ["Phone", "PasswordHash", "Salt", "Name", "Email", "Class", "Board", "Locality", "CreatedAt", "Reset Password"];
var STUDENT_EDITABLE = ["Name", "Email", "Class", "Board", "Locality"];

var TUTOR_COLUMNS = [
  "Phone", "PasswordHash", "Salt", "Name", "Email",
  "Subjects", "Classes", "Boards", "Exams", "Experience", "Qualification",
  "RatePerHour", "Description", "Photo", "Locality", "Mode", "Verified", "CreatedAt", "Reset Password"
];
var TUTOR_EDITABLE = [
  "Name", "Email", "Subjects", "Classes", "Boards", "Exams",
  "Experience", "Qualification", "RatePerHour", "Description", "Locality", "Mode"
];
// Verified and Reset Password are deliberately excluded from EDITABLE —
// only settable by hand in the sheet by whoever owns the Google
// account, never via the API.

var INTEREST_COLUMNS = ["Timestamp", "StudentPhone", "StudentName", "StudentClass", "StudentBoard", "StudentLocality", "TutorPhone", "TutorName", "Status"];
var SESSION_COLUMNS = ["Token", "Phone", "Role", "ExpiresAt"];

var MAX_PHOTO_BYTES = 1024 * 1024; // 1MB
var SESSION_DAYS = 30;
var HASH_ITERATIONS = 8000;
var MAX_LOGIN_ATTEMPTS = 5;
var LOGIN_LOCKOUT_SECONDS = 900; // 15 minutes

/* ================= registration & login ================= */

function handleRegister(body) {
  var role = body.role;
  if (role !== "student" && role !== "tutor") return jsonResponse({ ok: false, reason: "invalid_role" });

  var phone = normalizePhone(body.phone);
  if (phone.length !== 10) return jsonResponse({ ok: false, reason: "invalid_phone" });

  var password = String(body.password || "");
  if (password.length < 6) return jsonResponse({ ok: false, reason: "weak_password" });

  var sheet = getAccountSheet(role);
  if (findRowByPhone(sheet, phone)) return jsonResponse({ ok: false, reason: "phone_exists" });

  var salt = generateSalt();
  var hash = hashPassword(password, salt);
  var now = new Date();

  if (role === "student") {
    sheet.appendRow([phone, hash, salt, body.name || "", body.email || "", body.studentClass || "", body.board || "", body.locality || "", now, ""]);
  } else {
    sheet.appendRow([
      phone, hash, salt, body.name || "", body.email || "",
      body.subjects || "", body.classes || "", body.boards || "", body.exams || "",
      body.experience || "", body.qualification || "",
      body.rate || "", body.description || "", "", body.locality || "", body.mode || "",
      "No", now, ""
    ]);
  }

  var token = createSession(phone, role);
  return jsonResponse({ ok: true, token: token, role: role });
}

function handleLogin(body) {
  var role = body.role;
  if (role !== "student" && role !== "tutor") return jsonResponse({ ok: false, reason: "invalid_role" });

  var phone = normalizePhone(body.phone);
  var password = String(body.password || "");

  var cache = CacheService.getScriptCache();
  var rateLimitKey = "fail_" + role + "_" + phone;
  var fails = parseInt(cache.get(rateLimitKey) || "0", 10);
  if (fails >= MAX_LOGIN_ATTEMPTS) {
    return jsonResponse({ ok: false, reason: "too_many_attempts" });
  }

  var sheet = getAccountSheet(role);
  var found = findRowByPhone(sheet, phone);
  var valid = found && hashPassword(password, found.values[2]) === found.values[1];

  if (!valid) {
    cache.put(rateLimitKey, String(fails + 1), LOGIN_LOCKOUT_SECONDS);
    return jsonResponse({ ok: false, reason: "invalid_credentials" });
  }

  cache.remove(rateLimitKey);
  var token = createSession(phone, role);
  return jsonResponse({ ok: true, token: token, role: role, profile: rowToProfile(role, found.values) });
}

function handleLogout(body) {
  var sheet = getOrCreateSheet("Sessions", SESSION_COLUMNS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === body.token) { sheet.deleteRow(i + 1); break; }
  }
  return jsonResponse({ ok: true });
}

/* ================= profile ================= */

function handleGetProfile(body) {
  var session = requireSession(body);
  if (!session) return jsonResponse({ ok: false, reason: "unauthorized" });
  var sheet = getAccountSheet(session.role);
  var found = findRowByPhone(sheet, session.phone);
  if (!found) return jsonResponse({ ok: false, reason: "not_found" });
  return jsonResponse({ ok: true, profile: rowToProfile(session.role, found.values) });
}

function handleUpdateProfile(body) {
  var session = requireSession(body);
  if (!session) return jsonResponse({ ok: false, reason: "unauthorized" });

  var sheet = getAccountSheet(session.role);
  var found = findRowByPhone(sheet, session.phone);
  if (!found) return jsonResponse({ ok: false, reason: "not_found" });

  var columns = session.role === "student" ? STUDENT_COLUMNS : TUTOR_COLUMNS;
  var editable = session.role === "student" ? STUDENT_EDITABLE : TUTOR_EDITABLE;
  var data = body.data || {};

  editable.forEach(function (col) {
    if (Object.prototype.hasOwnProperty.call(data, col)) {
      var idx = columns.indexOf(col) + 1;
      if (idx > 0) sheet.getRange(found.row, idx).setValue(data[col]);
    }
  });

  return jsonResponse({ ok: true });
}

/* ================= tutor interest ================= */

function handleMarkInterested(body) {
  var session = requireSession(body);
  if (!session || session.role !== "student") return jsonResponse({ ok: false, reason: "unauthorized" });

  var studentSheet = getAccountSheet("student");
  var student = findRowByPhone(studentSheet, session.phone);
  if (!student) return jsonResponse({ ok: false, reason: "not_found" });
  var studentProfile = rowToProfile("student", student.values);

  var tutorPhone = normalizePhone(body.tutorPhone);
  var tutorSheet = getAccountSheet("tutor");
  var tutor = findRowByPhone(tutorSheet, tutorPhone);
  if (!tutor) return jsonResponse({ ok: false, reason: "tutor_not_found" });
  var tutorProfile = rowToProfile("tutor", tutor.values);

  var sheet = getOrCreateSheet("Interests", INTEREST_COLUMNS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(String(data[i][1])) === session.phone && normalizePhone(String(data[i][6])) === tutorPhone) {
      return jsonResponse({ ok: true, alreadySent: true });
    }
  }

  sheet.appendRow([
    new Date(), session.phone, studentProfile.Name || "",
    studentProfile.Class || "", studentProfile.Board || "", studentProfile.Locality || "",
    tutorPhone, tutorProfile.Name || "", "New"
  ]);
  return jsonResponse({ ok: true });
}

function handleGetMyInterests(body) {
  var session = requireSession(body);
  if (!session || session.role !== "student") return jsonResponse({ ok: false, reason: "unauthorized" });

  var sheet = getOrCreateSheet("Interests", INTEREST_COLUMNS);
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(String(data[i][1])) === session.phone) {
      rows.push({ TutorName: data[i][7], Status: data[i][8], Timestamp: data[i][0] });
    }
  }
  rows.reverse();
  return jsonResponse({ ok: true, interests: rows });
}

function handleGetTutorInterests(body) {
  var session = requireSession(body);
  if (!session || session.role !== "tutor") return jsonResponse({ ok: false, reason: "unauthorized" });

  var sheet = getOrCreateSheet("Interests", INTEREST_COLUMNS);
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(String(data[i][6])) === session.phone) {
      rows.push({
        StudentName: data[i][2], StudentPhone: data[i][1],
        StudentClass: data[i][3], StudentBoard: data[i][4], StudentLocality: data[i][5],
        Status: data[i][8], Timestamp: data[i][0]
      });
    }
  }
  rows.reverse();
  return jsonResponse({ ok: true, interests: rows });
}

/* ================= tutor photo upload ================= */

function handleUploadPhoto(body) {
  var session = requireSession(body);
  if (!session || session.role !== "tutor") return jsonResponse({ ok: false, reason: "unauthorized" });

  var bytes = Utilities.base64Decode(body.photoBase64 || "");
  if (bytes.length > MAX_PHOTO_BYTES) return jsonResponse({ ok: false, reason: "file_too_large" });

  var folder = getOrCreatePhotoFolder();
  var blob = Utilities.newBlob(bytes, body.mimeType || "image/jpeg", session.phone + "-" + Date.now());
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var url = "https://drive.google.com/uc?export=view&id=" + file.getId();

  var sheet = getAccountSheet("tutor");
  var found = findRowByPhone(sheet, session.phone);
  if (found) sheet.getRange(found.row, TUTOR_COLUMNS.indexOf("Photo") + 1).setValue(url);

  return jsonResponse({ ok: true, url: url });
}

function getOrCreatePhotoFolder() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("PHOTO_FOLDER_ID");
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* fall through and recreate */ }
  }
  var folder = DriveApp.createFolder("JT Tutor Photos");
  props.setProperty("PHOTO_FOLDER_ID", folder.getId());
  return folder;
}

/* ================= public tutor directory ================= */

function getPublicTutors() {
  var sheet = getAccountSheet("tutor");
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var verifiedIdx = headers.indexOf("Verified");

  var publicFields = ["Phone", "Name", "Subjects", "Classes", "Boards", "Exams", "Experience", "Qualification", "RatePerHour", "Description", "Photo", "Locality", "Mode"];

  var results = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][verifiedIdx]).toLowerCase() !== "yes") continue;
    var obj = {};
    publicFields.forEach(function (f) {
      var idx = headers.indexOf(f);
      obj[f] = idx >= 0 ? data[i][idx] : "";
    });
    results.push(obj);
  }
  return results;
}

/* ================= sessions ================= */

function createSession(phone, role) {
  var sheet = getOrCreateSheet("Sessions", SESSION_COLUMNS);
  var token = Utilities.getUuid() + Utilities.getUuid();
  var expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  sheet.appendRow([token, phone, role, expires]);
  return token;
}

function getSession(token) {
  if (!token) return null;
  var sheet = getOrCreateSheet("Sessions", SESSION_COLUMNS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      if (new Date(data[i][3]) < new Date()) return null;
      return { phone: data[i][1], role: data[i][2] };
    }
  }
  return null;
}

function requireSession(body) {
  return getSession(body.token);
}

/* ================= accounts helpers ================= */

function getAccountSheet(role) {
  return role === "student"
    ? getOrCreateSheet("Students", STUDENT_COLUMNS)
    : getOrCreateSheet("Tutors", TUTOR_COLUMNS);
}

function findRowByPhone(sheet, phone) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(String(data[i][0])) === phone) return { row: i + 1, values: data[i] };
  }
  return null;
}

function rowToProfile(role, values) {
  var columns = role === "student" ? STUDENT_COLUMNS : TUTOR_COLUMNS;
  var obj = {};
  columns.forEach(function (col, i) {
    if (col === "PasswordHash" || col === "Salt" || col === "Reset Password") return; // never expose
    obj[col] = values[i];
  });
  return obj;
}

/* ================= admin: reset a password from the sheet ================= */

/**
 * Type a new password into the "Reset Password" column for anyone's
 * row, in either Students or Tutors — this trigger picks it up,
 * hashes it, and clears the cell automatically. Nothing to run
 * manually, no deployment needed; it fires the moment you hit Enter.
 */
function onEdit(e) {
  try {
    var sheet = e.range.getSheet();
    var name = sheet.getName();
    if (name !== "Students" && name !== "Tutors") return;
    if (e.range.getRow() === 1) return; // header row

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var resetCol = headers.indexOf("Reset Password") + 1;
    if (resetCol === 0 || e.range.getColumn() !== resetCol) return;

    var newPassword = String(e.range.getValue() || "").trim();
    if (!newPassword) return;

    if (newPassword.length < 6) {
      e.range.setValue("Too short — needs 6+ characters, try again");
      return;
    }

    var salt = generateSalt();
    var hash = hashPassword(newPassword, salt);
    sheet.getRange(e.range.getRow(), headers.indexOf("PasswordHash") + 1).setValue(hash);
    sheet.getRange(e.range.getRow(), headers.indexOf("Salt") + 1).setValue(salt);
    e.range.setValue("✓ updated just now");
  } catch (err) {
    // simple triggers can't show alerts — fail quietly rather than break editing
  }
}

/* ================= one-time setup helper ================= */

function addVerifiedDropdown() {
  var sheet = getAccountSheet("tutor");
  var colIndex = TUTOR_COLUMNS.indexOf("Verified") + 1;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(["Yes", "No"], true).setAllowInvalid(false).build();
  sheet.getRange(2, colIndex, Math.max(sheet.getMaxRows() - 1, 200), 1).setDataValidation(rule);
  SpreadsheetApp.getUi().alert("Done. The Verified column now shows a Yes/No dropdown.");
}

/* ================= crypto helpers ================= */

function generateSalt() {
  return Utilities.getUuid();
}

function hashPassword(password, salt) {
  var value = String(password) + ":" + String(salt);
  for (var i = 0; i < HASH_ITERATIONS; i++) {
    value = bytesToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value));
  }
  return value;
}

function bytesToHex(bytes) {
  return bytes.map(function (b) {
    var v = b < 0 ? b + 256 : b;
    return (v < 16 ? "0" : "") + v.toString(16);
  }).join("");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}
