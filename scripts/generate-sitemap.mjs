import { promises as fs } from "node:fs";
import path from "node:path";

import htmlDiscovery from "./utils/html-discovery.js";

const { listSourceHtmlFiles } = htmlDiscovery;

const rootDir = process.cwd();
const publishDir = path.join(rootDir, "dist");

// Sitemap-only exclusions on top of the shared source-discovery rules.
const EXCLUDED_TOP_LEVEL_DIRS = ["build"];
const EXCLUDED_FILES = new Set(["404.html", "offline.html", "thank-you.html"]);
const EXCLUDED_PREFIXES = [];

function normalizeSlashes(value) {
  return value.split(path.sep).join("/");
}

function shouldExclude(relativePath) {
  const normalized = normalizeSlashes(relativePath);
  const filename = path.posix.basename(normalized);

  if (EXCLUDED_FILES.has(filename)) {
    return true;
  }

  return EXCLUDED_PREFIXES.some((prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix));
}

async function listIndexableHtmlFiles() {
  const htmlFiles = await listSourceHtmlFiles(rootDir, { excludedTopLevelDirs: EXCLUDED_TOP_LEVEL_DIRS });
  return htmlFiles.filter((relPath) => !shouldExclude(relPath)).map(normalizeSlashes);
}

function buildPageUrl(siteUrl, relHtmlPath) {
  if (relHtmlPath === "index.html") {
    return new URL("/", siteUrl).toString();
  }

  return new URL(`/${relHtmlPath}`, siteUrl).toString();
}

function renderSitemap(urls) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

  for (const url of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${url}</loc>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>", "");
  return lines.join("\n");
}

function getOutputPath() {
  return path.join(publishDir, "sitemap.xml");
}

async function main() {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    console.error("FAIL: SITE_URL is required. Example: SITE_URL=https://example.com npm run build:sitemap");
    process.exit(1);
  }

  const htmlFiles = await listIndexableHtmlFiles();
  const uniqueFiles = [...new Set(htmlFiles)].sort((a, b) => a.localeCompare(b));

  const urls = uniqueFiles.map((file) => buildPageUrl(siteUrl, file));
  const sitemap = renderSitemap(urls);

  const outputPath = getOutputPath();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, sitemap, "utf8");

  const outRelPath = normalizeSlashes(path.relative(rootDir, outputPath));
  console.log(`OK: sitemap generated with ${urls.length} URL(s) -> ${outRelPath}`);
}

main().catch((error) => {
  console.error("FAIL: sitemap generation failed.");
  console.error(error.stack || String(error));
  process.exit(1);
});
