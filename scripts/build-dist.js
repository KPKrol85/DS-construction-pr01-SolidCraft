const fs = require("fs/promises");
const path = require("path");
const { createLogger } = require("./utils/logger");

const logger = createLogger();

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

const EXCLUDED_TOP_LEVEL_DIRS = new Set([".git", "node_modules", "dist"]);

const REQUIRED_FILES = [
  "css/style.min.css",
  "js/script.min.js",
  "js/theme-init.min.js",
];
const OPTIONAL_FILES = [
  "_headers",
  "_redirects",
  "netlify.toml",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "sw.js",
  "js/sw-register.js",
];
const OPTIONAL_DIRS = ["assets"];

async function pathExists(absPath) {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureRequiredFilesExist() {
  for (const relPath of REQUIRED_FILES) {
    const absPath = path.join(rootDir, relPath);
    if (!(await pathExists(absPath))) {
      throw new Error(
        `Missing required production asset: ${relPath}. Run "npm run build" first.`,
      );
    }
  }
}

async function copyFileByRelativePath(relPath) {
  const src = path.join(rootDir, relPath);
  const dest = path.join(distDir, relPath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function listHtmlFilesRecursively(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const results = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, absPath);
    const topLevel = relPath.split(path.sep)[0];

    if (entry.isDirectory()) {
      if (EXCLUDED_TOP_LEVEL_DIRS.has(topLevel)) continue;
      const nested = await listHtmlFilesRecursively(absPath);
      results.push(...nested);
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".html") {
      results.push(relPath);
    }
  }

  return results;
}

async function copyDirRecursive(
  srcDir,
  destDir,
  { skipRelDirNames = new Set() } = {},
) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const relPath = path.relative(rootDir, srcPath);

    if (entry.isDirectory()) {
      const relNorm = relPath.split(path.sep).join("/");
      const dirName = path.basename(srcPath);
      if (skipRelDirNames.has(relNorm) || skipRelDirNames.has(dirName))
        continue;

      await fs.mkdir(destPath, { recursive: true });
      await copyDirRecursive(srcPath, destPath, { skipRelDirNames });
      continue;
    }

    if (entry.isFile()) {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function copyRuntimeFilesToDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await ensureRequiredFilesExist();

  const htmlFiles = await listHtmlFilesRecursively(rootDir);
  logger.debug(`build-dist: discovered ${htmlFiles.length} HTML file(s)`);
  for (const relPath of htmlFiles) {
    await copyFileByRelativePath(relPath);
  }

  for (const relPath of REQUIRED_FILES) {
    await copyFileByRelativePath(relPath);
  }

  for (const relPath of OPTIONAL_FILES) {
    const absPath = path.join(rootDir, relPath);
    if (await pathExists(absPath)) {
      await copyFileByRelativePath(relPath);
    }
  }

  for (const relDir of OPTIONAL_DIRS) {
    const srcDir = path.join(rootDir, relDir);
    if (!(await pathExists(srcDir))) continue;

    const destDir = path.join(distDir, relDir);
    await fs.mkdir(destDir, { recursive: true });
    await copyDirRecursive(srcDir, destDir, {
      skipRelDirNames: new Set(["img-src"]),
    });
  }
}

async function rewriteHtmlReferencesInDist(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  let rewrittenCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      rewrittenCount += await rewriteHtmlReferencesInDist(fullPath);
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".html") {
      continue;
    }

    const html = await fs.readFile(fullPath, "utf8");
    const updatedHtml = html
      .replaceAll("css/style.css", "css/style.min.css")
      .replaceAll("js/script.js", "js/script.min.js")
      .replaceAll("js/theme-init.js", "js/theme-init.min.js");

    if (updatedHtml !== html) {
      await fs.writeFile(fullPath, updatedHtml, "utf8");
      rewrittenCount += 1;
    }
  }

  return rewrittenCount;
}

async function build() {
  logger.debug("build-dist: start");
  await copyRuntimeFilesToDist();
  const rewrittenCount = await rewriteHtmlReferencesInDist(distDir);
  logger.summary(
    `OK: dist build completed (rewrote ${rewrittenCount} HTML file(s)).`,
  );
}

build().catch((error) => {
  logger.error("FAIL: dist build failed.");
  logger.error(error.stack || String(error));
  process.exit(1);
});
