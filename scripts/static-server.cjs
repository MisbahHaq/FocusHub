const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "frontend");
const PORT = 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/dashboard.html";

  let filePath = path.join(ROOT, urlPath);
  const ext = path.extname(urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (ext === '.js') {
      res.writeHead(404, { "Content-Type": "text/javascript; charset=utf-8" });
      res.end("// File not found: " + urlPath);
      return;
    }
    filePath = path.join(ROOT, "dashboard.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Focus Synergy dev server running at http://localhost:${PORT}`);
});
