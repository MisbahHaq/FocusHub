const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const envSrc = path.join(ROOT, "env.js");
const envDest = path.join(FRONTEND, "env.js");
const dotEnvPath = path.join(ROOT, ".env");

function parseDotEnv(filePath) {
  const vars = {};
  if (!fs.existsSync(filePath)) return vars;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function getEnv() {
  // Prefer real environment variables (Netlify injects these at build time),
  // falling back to a local .env file for development.
  const fileVars = parseDotEnv(dotEnvPath);
  return { ...fileVars, ...process.env };
}

const hasEnvVars = Boolean(process.env.FIREBASE_API_KEY || process.env.FIREBASE_PROJECT_ID);

if (fs.existsSync(dotEnvPath) || hasEnvVars) {
  const env = getEnv();
  const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID,
  };
  const cloudinary = {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
  };

  const out = `window.__FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 4)};\nwindow.__CLOUDINARY_CONFIG__ = ${JSON.stringify(cloudinary, null, 4)};\n`;
  fs.writeFileSync(envDest, out);
  console.log("Generated frontend/env.js from .env.");
} else if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("Copied env.js into frontend build context.");
} else {
  console.warn("No .env or env.js source found; frontend/env.js was not generated.");
}
