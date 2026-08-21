const fs = require("fs");
const path = require("path");
const url = require("url");
const liveServer = require("live-server");
const { createLogger } = require("./utils/logger");
const { renderHtmlFile } = require("./utils/partials");

const logger = createLogger();

const rootDir = process.cwd();
const PORT = 15500;
const ENTRY_FILE = "index.html";

/* live-server injects its reload snippet only into files it serves itself.
   The partials middleware answers HTML requests, so it re-adds the same
   snippet; without it, saving a file would no longer refresh the browser. */
function loadReloadSnippet() {
  try {
    return fs.readFileSync(
      require.resolve("live-server/injected.html"),
      "utf8",
    );
  } catch {
    logger.warn(
      "WARN: live-server reload snippet not found; dev pages will not auto-refresh.",
    );
    return "";
  }
}

function resolveHtmlRequest(requestUrl) {
  const pathname = decodeURIComponent(url.parse(requestUrl).pathname || "/");
  const relative = pathname.replace(/^\/+/, "") || ENTRY_FILE;
  const candidate = relative.endsWith("/")
    ? path.join(relative, ENTRY_FILE)
    : relative;

  const absPath = path.resolve(rootDir, candidate);
  if (!absPath.startsWith(rootDir)) return null;
  if (path.extname(absPath).toLowerCase() !== ".html") return null;
  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) return null;

  return absPath;
}

/* Renders maintained pages on every request so editing partials/ is visible
   after a plain browser refresh — the same expansion the production build
   performs, just resolved on demand. */
function createPartialsMiddleware() {
  const reloadSnippet = loadReloadSnippet();

  return function partialsMiddleware(req, res, next) {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const absPath = resolveHtmlRequest(req.url || "/");
    if (!absPath) return next();

    renderHtmlFile(absPath, { rootDir })
      .then(({ html }) => {
        const body = reloadSnippet
          ? html.replace(/<\/body>/i, `${reloadSnippet}</body>`)
          : html;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(req.method === "HEAD" ? undefined : body);
      })
      .catch((error) => {
        logger.error(`FAIL: ${error.message}`);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(`Partial render failed.\n\n${error.message}\n`);
      });
  };
}

liveServer.start({
  root: rootDir,
  port: PORT,
  open: ENTRY_FILE,
  logLevel: 0,
  middleware: [createPartialsMiddleware()],
});

logger.summary(
  `OK: dev server on http://127.0.0.1:${PORT}/ (shared partials rendered per request).`,
);
