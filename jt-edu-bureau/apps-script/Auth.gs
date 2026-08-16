/**
 * JT EDUCATION BUREAU — accounts, sessions, profiles, requests,
 * and photo upload. Phone + password, stored only as a salted,
 * stretched hash — never plaintext.
 *
 * Honest limitation, stated plainly: this is a hand-built login
 * system, not a dedicated auth provider. It hashes and salts
 * passwords, rate-limits guessing, and never returns another
 * account's data — but it doesn't have the years of hardening a
 * service like Supabase Auth has. Reasonable for the bureau's
 * current scale; worth revisiting if the business scales up a lot
 * or handles anything more sensitive than tutoring logistics.
 */

var STUDENT_COLUMNS = ["Phone", "PasswordHash", "Salt", "Name", "Email", "CreatedAt"];
var STUDENT_EDITABLE = ["Name", "Email"];

var TUTOR_COLUMNS = [
  "Phone", "PasswordHash", "Salt", "Name", "Email",
  "Subjects", "Classes", "Boards", "Exams", "Experience", "Qualification",
  "RatePerHour", "Description", "Photo", "Locality", "Mode", "Verified", "CreatedAt"
];
var TUTOR_EDITABLE = [
  "Name", "Email", "Subjects", "Classes", "Boards", "Exams",
  "Experience", "Qualification", "RatePerHour", "Description", "Locality", "Mode"
];
// Verified is deliberately excluded — only settable by hand in the
// sheet by whoever owns the Google account, never via the API.

var REQUEST_COLUMNS = ["Timestamp", "StudentPhone", "Subject", "Class", "Board", "Mode", "Locality", "Notes", "Status"];
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
    sheet.appendRow([phone, hash, salt, body.name || "", body.email || "", now]);
  } else {
    sheet.appendRow([
      phone, hash, salt, body.name || "", body.email || "",
      body.subjects || "", body.classes || "", body.boards || "", body.exams || "",
      body.experience || "", body.qualification || "",
      body.rate || "", body.description || "", "", body.locality || "", body.mode || "",
      "No", now
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

/* ================= student requests ================= */

function handleSubmitRequest(body) {
  var session = requireSession(body);
  if (!session || session.role !== "student") return jsonResponse({ ok: false, reason: "unauthorized" });

  var sheet = getOrCreateSheet("Requests", REQUEST_COLUMNS);
  var d = body.data || {};
  sheet.appendRow([new Date(), session.phone, d.Subject || "", d.Class || "", d.Board || "", d.Mode || "", d.Locality || "", d.Notes || "", "New"]);
  return jsonResponse({ ok: true });
}

function handleGetMyRequests(body) {
  var session = requireSession(body);
  if (!session || session.role !== "student") return jsonResponse({ ok: false, reason: "unauthorized" });

  var sheet = getOrCreateSheet("Requests", REQUEST_COLUMNS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var phoneIdx = headers.indexOf("StudentPhone");

  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(String(data[i][phoneIdx])) === session.phone) {
      var obj = {};
      headers.forEach(function (h, idx) { obj[h] = data[i][idx]; });
      rows.push(obj);
    }
  }
  rows.reverse(); // newest first
  return jsonResponse({ ok: true, requests: rows });
}

/* ================= tutor photo upload ================= */

function handleUploadPhoto(body) {
  var session = requireSession(body);
  if (!session || session.role !== "tutor") return jsonResponse({ ok: false, reason: "unauthorized" });

  var base64 = body.photoBase64 || "";
  var bytes = Utilities.base64Decode(base64);
  if (bytes.length > MAX_PHOTO_BYTES) {
    return jsonResponse({ ok: false, reason: "file_too_large" });
  }

  var folder = getOrCreatePhotoFolder();
  var blob = Utilities.newBlob(bytes, body.mimeType || "image/jpeg", session.phone + "-" + Date.now());
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var url = "https://lh3.googleusercontent.com/d/" + file.getId();

  var sheet = getAccountSheet("tutor");
  var found = findRowByPhone(sheet, session.phone);
  if (found) {
    sheet.getRange(found.row, TUTOR_COLUMNS.indexOf("Photo") + 1).setValue(url);
  }

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

  // Only ever return fields safe for the public internet — phone,
  // email, password hash and salt never leave this function.
  var publicFields = ["Name", "Subjects", "Classes", "Boards", "Exams", "Experience", "Qualification", "RatePerHour", "Description", "Photo", "Locality", "Mode"];

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
      if (new Date(data[i][3]) < new Date()) return null; // expired
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
    ? getOrCreateSheet("Student Accounts", STUDENT_COLUMNS)
    : getOrCreateSheet("Tutor Accounts", TUTOR_COLUMNS);
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
    if (col === "PasswordHash" || col === "Salt") return; // never expose, even to the account owner's own client
    obj[col] = values[i];
  });
  return obj;
}

/* ================= crypto helpers ================= */
/* Apps Script has no bcrypt/scrypt/Argon2, so iterated SHA-256 is
   used as a lightweight stand-in for a slow hash — meaningfully
   raises brute-force cost over a single unsalted hash, though it's
   not as strong as a dedicated password-hashing algorithm. */

function generateSalt() {
  return Utilities.getUuid();
}

function hashPassword(password, salt) {
  var value = String(password) + ":" + String(salt);
  for (var i = 0; i < HASH_ITERATIONS; i++) {
    var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
    value = bytesToHex(bytes);
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
