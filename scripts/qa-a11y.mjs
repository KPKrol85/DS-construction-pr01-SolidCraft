#!/usr/bin/env node

import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveContentType } from "./utils/mime-types.mjs";
import partials from "./utils/partials.js";

const { renderHtmlFile } = partials;

const projectRoot = process.cwd();
const thresholds = {
  failOnImpacts: new Set(["serious", "critical"]),
};

// Required routes: the entry, error and form-confirmation pages plus every
// maintained oferta/ service page and root-level legal page, so each shipped
// page variant is scanned. A missing entry fails the run instead of silently
// shrinking the gate.
const basePages = [
  "/index.html",
  "/404.html",
  "/thank-you.html",
  "/oferta/elektryka.html",
  "/oferta/hydraulika.html",
  "/oferta/kafelkowanie.html",
  "/oferta/lazienki.html",
  "/oferta/malowanie.html",
  "/oferta/remonty.html",
  "/cookies.html",
  "/polityka-prywatnosci.html",
  "/regulamin.html",
];

const optionalPages = ["/offline.html"];

// Every route is scanned once per supported theme. The theme is seeded through
// the same localStorage key that js/theme-init.js reads before first paint.
const themes = ["light", "dark"];
const THEME_STORAGE_KEY = "theme";

// The home page opens its first-visit project modal for a fresh visitor. It is
// scanned with the modal open, then again after dismissal through the modal's
// own accept button, so the page content behind the overlay is covered too.
const MODAL_ROUTE = "/index.html";
const MODAL_SELECTOR = "#projectBanner";
const MODAL_ACCEPT_SELECTOR = "#projectBannerAccept";

// A scan whose rendering is not in the expected settled state is not
// evaluated; the run fails instead, so axe never audits half-revealed content.
class ScanPreconditionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ScanPreconditionError";
  }
}

const { chromium } = await loadDependency("playwright");
const axeCoreModule = await loadDependency("axe-core");
const axeCore = axeCoreModule.default ?? axeCoreModule;

const pages = await resolvePages();
const server = await startStaticServer();
const baseUrl = `http://127.0.0.1:${server.port}`;
const failures = [];
const scans = [];
let browser;
let preconditionError = null;

try {
  browser = await chromium.launch({ headless: true });

  for (const theme of themes) {
    for (const route of pages) {
      await scanRoute(route, theme);
    }
  }
} catch (error) {
  if (!(error instanceof ScanPreconditionError)) throw error;
  preconditionError = error;
} finally {
  await browser?.close();
  await stopServer(server.server);
}

if (preconditionError) {
  console.error(
    `FAIL qa:a11y (scan precondition not met after ${scans.length} completed scan${scans.length === 1 ? "" : "s"})`,
  );
  console.error(`- ${preconditionError.message}`);
  process.exit(1);
}

if (failures.length > 0) {
  console.error(
    `FAIL qa:a11y (${failures.length} serious/critical issue${failures.length === 1 ? "" : "s"} across ${scans.length} scan${scans.length === 1 ? "" : "s"})`,
  );
  for (const failure of failures) {
    console.error(
      `- ${describeScan(failure)} | ${failure.id} | ${failure.impact} | ${failure.selectors}`,
    );
  }
  process.exit(1);
}

console.log(
  `PASS qa:a11y (${scans.length} scans: ${pages.length} routes × ${themes.join("/")} themes, home-page modal open and dismissed; 0 serious/critical violations)`,
);

// Each route/theme pair gets its own browser context, so theme and modal
// state stored by one scan cannot leak into the next. Reduced motion is the
// supported path under which css/modules/utilities.css and initScrollReveal
// render [data-reveal] content fully visible without animating it.
async function scanRoute(route, theme) {
  const context = await browser.newContext({ reducedMotion: "reduce" });

  try {
    await context.addInitScript(
      ({ key, value }) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* about:blank has no accessible storage; the real page seeds it. */
        }
      },
      { key: THEME_STORAGE_KEY, value: theme },
    );

    const page = await context.newPage();
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeCore.source });

    if (route !== MODAL_ROUTE) {
      await runScan(page, { route, theme });
      return;
    }

    await runScan(page, { route, theme, modal: "open" });
    await page.locator(MODAL_ACCEPT_SELECTOR).click();
    await runScan(page, { route, theme, modal: "dismissed" });
  } finally {
    await context.close();
  }
}

async function runScan(page, scan) {
  await verifyScanState(page, scan);

  const result = await page.evaluate(async () => window.axe.run());
  scans.push(scan);

  for (const violation of result.violations) {
    const impact = violation.impact || "unknown";
    if (!thresholds.failOnImpacts.has(impact)) continue;
    const targets = violation.nodes.flatMap((node) => node.target);
    const selectors = targets.slice(0, 3).join(", ");
    const remaining = targets.length - 3;

    failures.push({
      ...scan,
      id: violation.id,
      impact,
      selectors:
        (selectors || "n/a") + (remaining > 0 ? ` (+${remaining} more)` : ""),
    });
  }
}

// Confirms the rendering axe is about to evaluate: web fonts settled, the
// requested theme applied, every [data-reveal] element fully opaque and, on
// the home page, the modal in the expected open or dismissed state.
async function verifyScanState(page, scan) {
  const label = describeScan(scan);

  try {
    await page.waitForFunction(() => document.fonts.status === "loaded");
  } catch (error) {
    throw new ScanPreconditionError(
      `${label}: web fonts did not finish loading (${error.message})`,
    );
  }

  const state = await page.evaluate(() => {
    const describe = (el) =>
      el.id
        ? `#${el.id}`
        : `${el.tagName.toLowerCase()}${el.classList.length ? `.${el.classList[0]}` : ""}[data-reveal]`;

    return {
      theme: document.documentElement.dataset.theme ?? null,
      failedFonts: Array.from(document.fonts)
        .filter((face) => face.status === "error")
        .map((face) => `${face.family} ${face.weight}`),
      revealTotal: document.querySelectorAll("[data-reveal]").length,
      revealIncomplete: Array.from(document.querySelectorAll("[data-reveal]"))
        .map((el) => ({ el, opacity: getComputedStyle(el).opacity }))
        .filter(({ opacity }) => opacity !== "1")
        .map(({ el, opacity }) => `${describe(el)} (opacity ${opacity})`),
    };
  });

  if (state.failedFonts.length > 0) {
    throw new ScanPreconditionError(
      `${label}: web font(s) failed to load: ${state.failedFonts.join(", ")}`,
    );
  }

  if (state.theme !== scan.theme) {
    throw new ScanPreconditionError(
      `${label}: expected data-theme="${scan.theme}", found ${state.theme === null ? "no data-theme" : `"${state.theme}"`}`,
    );
  }

  if (state.revealIncomplete.length > 0) {
    throw new ScanPreconditionError(
      `${label}: ${state.revealIncomplete.length} of ${state.revealTotal} [data-reveal] element(s) not fully opaque: ${state.revealIncomplete.slice(0, 5).join(", ")}`,
    );
  }

  if (scan.modal) await verifyModalState(page, scan, label);
}

async function verifyModalState(page, scan, label) {
  const banner = page.locator(MODAL_SELECTOR);
  const count = await banner.count();
  if (count !== 1) {
    throw new ScanPreconditionError(
      `${label}: expected one ${MODAL_SELECTOR}, found ${count}`,
    );
  }

  const expectOpen = scan.modal === "open";
  const visible = await banner.isVisible();
  const ariaHidden = await banner.getAttribute("aria-hidden");
  const expectedAriaHidden = expectOpen ? "false" : "true";

  if (visible !== expectOpen || ariaHidden !== expectedAriaHidden) {
    throw new ScanPreconditionError(
      `${label}: expected ${MODAL_SELECTOR} ${expectOpen ? "visible" : "hidden"} with aria-hidden="${expectedAriaHidden}", found ${visible ? "visible" : "hidden"} with aria-hidden=${ariaHidden === null ? "unset" : `"${ariaHidden}"`}`,
    );
  }
}

function describeScan({ route, theme, modal }) {
  return `${route} | ${theme}${modal ? ` | modal ${modal}` : ""}`;
}

async function resolvePages() {
  const existing = [];
  for (const pageRoute of basePages) {
    const target = path.join(projectRoot, pageRoute.replace(/^\//, ""));
    if (!(await pathExists(target))) {
      throw new Error(`Required page not found: ${pageRoute}`);
    }
    existing.push(pageRoute);
  }

  for (const pageRoute of optionalPages) {
    const target = path.join(projectRoot, pageRoute.replace(/^\//, ""));
    if (await pathExists(target)) existing.push(pageRoute);
  }

  return existing;
}

async function pathExists(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function resolveServerPath(urlPath) {
  const withoutQuery = urlPath.split("?")[0].split("#")[0];
  const relative =
    decodeURIComponent(withoutQuery).replace(/^\/+/, "") || "index.html";
  return path.join(projectRoot, relative);
}

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    const reqUrl = req.url || "/";
    let filePath = resolveServerPath(reqUrl);

    const stat = await safeStat(filePath);
    if (stat?.isDirectory()) filePath = path.join(filePath, "index.html");

    const exists = await safeStat(filePath);
    if (!exists?.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    // Serve pages with their shared header/footer expanded, so axe audits the
    // same document a browser receives from dist/.
    const data =
      ext === ".html"
        ? Buffer.from(
            (await renderHtmlFile(filePath, { rootDir: projectRoot })).html,
            "utf8",
          )
        : await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": resolveContentType(ext) });
    res.end(data);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    server,
    port: typeof address === "object" && address ? address.port : 0,
  };
}

async function stopServer(server) {
  await new Promise((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
}

async function safeStat(file) {
  try {
    return await fs.stat(file);
  } catch {
    return null;
  }
}

async function loadDependency(name) {
  try {
    return await import(name);
  } catch {
    console.error(
      `Missing dependency: ${name}. Run \"npm install\" to install local QA tooling.`,
    );
    process.exit(1);
  }
}
