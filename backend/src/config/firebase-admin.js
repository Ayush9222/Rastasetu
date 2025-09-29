const admin = require("firebase-admin");
const path = require("path");
let serviceAccount;
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (serviceAccountEnv) {
  // If the env contains an absolute path, use it.
  // If it's relative and starts with './' or '../', resolve it against the
  // repository root (process.cwd()) because many people set the path in the
  // backend `.env` relative to the project root. Otherwise resolve relative
  // to this config file's directory.
  let serviceAccountPath;
  if (path.isAbsolute(serviceAccountEnv)) {
    serviceAccountPath = serviceAccountEnv;
  } else if (
    serviceAccountEnv.startsWith("./") ||
    serviceAccountEnv.startsWith("../")
  ) {
    serviceAccountPath = path.resolve(process.cwd(), serviceAccountEnv);
  } else {
    serviceAccountPath = path.resolve(__dirname, serviceAccountEnv);
  }

  try {
    serviceAccount = require(serviceAccountPath);
  } catch (err) {
    console.warn(
      "Firebase service account not loaded; ensure FIREBASE_SERVICE_ACCOUNT_PATH points to a valid JSON file",
      serviceAccountPath
    );
  }
} else {
  console.warn(
    "FIREBASE_SERVICE_ACCOUNT_PATH not set; Firebase Admin will not be initialized. Set the env var to enable token verification."
  );
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
