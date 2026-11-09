const fs = require("fs/promises");
const path = require("path");
const { PARTIALS_DIR_NAME } = require("./partials");

/* Shared source-HTML discovery for the production generators.

   Walks the project root depth-first, visiting directory entries in
   localeCompare order, and returns every *.html file (extension matched
   case-insensitively) as a native relative path in traversal order.

   Exclusions apply to top-level directories only: a nested directory that
   happens to share an excluded name is still traversed. Consumers add their
   own top-level exclusions and file-level filtering on top of this list. */

const SHARED_EXCLUDED_TOP_LEVEL_DIRS = Object.freeze([
  ".git",
  ".claude",
  ".codex",
  ".lighthouse-reports",
  "node_modules",
  "dist",
  PARTIALS_DIR_NAME,
]);

async function listSourceHtmlFiles(
  rootDir,
  { excludedTopLevelDirs = [] } = {},
) {
  const excluded = new Set([
    ...SHARED_EXCLUDED_TOP_LEVEL_DIRS,
    ...excludedTopLevelDirs,
  ]);
  const results = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const absPath = path.join(dir, entry.name);
      const relPath = path.relative(rootDir, absPath);

      if (entry.isDirectory()) {
        if (excluded.has(relPath.split(path.sep)[0])) continue;
        await walk(absPath);
        continue;
      }

      if (
        entry.isFile() &&
        path.extname(entry.name).toLowerCase() === ".html"
      ) {
        results.push(relPath);
      }
    }
  }

  await walk(rootDir);
  return results;
}

module.exports = {
  SHARED_EXCLUDED_TOP_LEVEL_DIRS,
  listSourceHtmlFiles,
};
