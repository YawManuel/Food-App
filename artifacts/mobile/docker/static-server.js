/**
 * Static file server for the containerised Expo web export.
 *
 * The app is an expo-router SPA (`web.output: "single"`), so any path that
 * isn't a real file on disk must fall back to index.html and let the client
 * router resolve it.
 *
 * Zero dependencies — Node built-ins only, so the runtime image needs no
 * node_modules at all.
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// Defaults to the ./static directory the image copies the export into;
// override to point at artifacts/mobile/dist when testing outside a container.
const STATIC_ROOT = path.resolve(
  process.env.STATIC_ROOT || path.join(__dirname, "static"),
);
const INDEX_HTML = path.join(STATIC_ROOT, "index.html");
const PORT = Number.parseInt(process.env.PORT || "8081", 10);
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

// Hashed assets under /_expo/ and /assets/ are immutable; everything else
// (index.html above all) must be revalidated so redeploys are picked up.
function cacheControlFor(pathname) {
  if (pathname.startsWith("/_expo/") || pathname.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=0, must-revalidate";
}

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = path.resolve(STATIC_ROOT, "." + path.posix.normalize(decoded));

  // Guard against traversal out of the static root via `..` or encoded paths.
  if (candidate !== STATIC_ROOT && !candidate.startsWith(STATIC_ROOT + path.sep)) {
    return null;
  }
  if (!fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
    return null;
  }
  return candidate;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed", { allow: "GET, HEAD" });
  }

  const { pathname } = new URL(req.url || "/", `http://${req.headers.host}`);

  if (pathname === "/healthz") {
    return send(res, 200, JSON.stringify({ status: "ok" }), {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
  }

  const filePath = resolveFile(pathname);

  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return send(res, 200, fs.readFileSync(filePath), {
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "cache-control": cacheControlFor(pathname),
    });
  }

  // SPA fallback — unknown paths are client-side routes.
  if (fs.existsSync(INDEX_HTML)) {
    return send(res, 200, fs.readFileSync(INDEX_HTML), {
      "content-type": MIME_TYPES[".html"],
      "cache-control": "public, max-age=0, must-revalidate",
    });
  }

  return send(res, 404, "Not Found", { "content-type": "text/plain" });
});

server.listen(PORT, HOST, () => {
  console.log(`ASAP web build served on http://${HOST}:${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
