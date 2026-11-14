const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { createLogger } = require("./utils/logger");

const logger = createLogger();

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.join(PROJECT_ROOT, "assets", "img-src");
const OUT_ROOT = path.join(PROJECT_ROOT, "assets", "img");

const HERO_SIZES = [
  { width: 400, height: 225 },
  { width: 800, height: 450 },
  { width: 1200, height: 675 },
  { width: 1600, height: 900 },
  { width: 2400, height: 1350 },
  { width: 3200, height: 1800 },
];

/* Art-directed crop of each hero source for portrait viewports, where the
   16:9 frame would otherwise be cut to a narrow slice and upscaled. The crop
   is the largest region with the given aspect ratio, centered horizontally on
   `focusX` (a fraction of the source width) and clamped to the frame, so it is
   derived from the master on every run instead of being a second source. */
const HERO_PORTRAIT_CROP = {
  suffix: "portrait",
  aspect: { width: 4, height: 5 },
  focusX: 0.62,
  sizes: [
    { width: 480, height: 600 },
    { width: 720, height: 900 },
    { width: 1080, height: 1350 },
    { width: 1440, height: 1800 },
  ],
};

const SERVICE_SIZES = [
  { width: 400, height: 300 },
  { width: 800, height: 600 },
  { width: 1200, height: 900 },
  { width: 1600, height: 1200 },
];

const GALLERY_SIZES = [
  { width: 480, height: 360 },
  { width: 768, height: 576 },
  { width: 1024, height: 768 },
  { width: 1536, height: 1152 },
  { width: 2048, height: 1536 },
];

/* Every outputDir below is owned outright by this script: its whole content is
   regenerated from assets/img-src/, so anything found there that the current
   configuration would not produce is an obsolete leftover. Directories under
   assets/img/ that are absent from this list (favicon/, logo/, partners-logos/,
   shortcuts/) are hand-maintained and are never touched. */
const CONFIG = [
  {
    name: "hero",
    inputDir: "hero",
    outputDir: "hero",
    sizes: HERO_SIZES,
    crops: [HERO_PORTRAIT_CROP],
    nameFor: (baseName, size) => `${baseName}-${size.width}-${size.height}`,
    formats: ["avif", "webp", "jpg"],
  },
  {
    name: "services",
    inputDir: "services",
    outputDir: "services",
    sizes: SERVICE_SIZES,
    nameFor: (baseName, size) => `${baseName}-${size.width}x${size.height}`,
    formats: ["avif", "webp", "jpg"],
  },
  {
    name: "gallery",
    inputDir: "gallery",
    outputDir: "gallery",
    sizes: GALLERY_SIZES,
    nameFor: (baseName, size) => `${baseName}-${size.width}x${size.height}`,
    formats: ["avif", "webp", "jpg"],
  },
  {
    name: "og",
    inputDir: "og",
    outputDir: "og",
    sizes: null,
    nameFor: (baseName) => baseName,
    formats: ["avif", "webp", "source"],
  },
  {
    name: "screenshots",
    inputDir: "screenshots",
    outputDir: "screenshots",
    sizes: null,
    nameFor: (baseName) => baseName,
    formats: ["avif", "webp", "source"],
  },
];

const GROUP_NAMES = CONFIG.map((config) => config.name);

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png"]);

const QUALITY = {
  webp: { quality: 80 },
  avif: { quality: 50, effort: 4 },
  jpg: { quality: 82, mozjpeg: true },
};

const USAGE =
  "Usage: node scripts/images.js <build|clean> [--only=<group>[,<group>]] [--force] [--dry-run] [--verbose]";

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/* True when `child` lies strictly below `parent`; the guard behind every path
   this script derives, writes, or deletes. */
function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative !== "" &&
    relative.split(path.sep)[0] !== ".." &&
    !path.isAbsolute(relative)
  );
}

function relPath(filePath) {
  return path.relative(PROJECT_ROOT, filePath);
}

/* Entries are sorted so that scanning, collision reports, and output order are
   identical on every platform and every run. */
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/* Single source of truth for "which files does this source image produce".
   Generation and cleanup both read it, so the canonical set can never drift
   into a second, hand-maintained list of allowed filenames.

   A source keeps its subdirectory below the group's input directory, so
   gallery/bathrooms/bathr-01.jpg produces gallery/bathrooms/bathr-01-*.
   Category subdirectories therefore cannot be flattened into one namespace. */
function expectedOutputsForFile(filePath, config) {
  const ext = path.extname(filePath).toLowerCase();
  if (!INPUT_EXTS.has(ext)) {
    return [];
  }

  const baseName = path.basename(filePath, ext);
  const inputDir = path.join(SRC_ROOT, config.inputDir);
  const outputDir = path.join(OUT_ROOT, config.outputDir);
  const targetDir = path.join(
    outputDir,
    path.relative(inputDir, path.dirname(filePath)),
  );
  /* The full frame first, then each art-directed crop under its own suffix
     (hero.jpg → hero-<w>-<h> and hero-portrait-<w>-<h>). */
  const variants = [
    { name: baseName, sizes: config.sizes || [null], crop: null },
    ...(config.crops || []).map((crop) => ({
      name: `${baseName}-${crop.suffix}`,
      sizes: crop.sizes,
      crop,
    })),
  ];
  const outputs = [];

  for (const variant of variants) {
    for (const size of variant.sizes) {
      const outputBase = config.nameFor(variant.name, size);
      for (const format of config.formats) {
        const actualFormat = format === "source" ? ext.slice(1) : format;
        const outputPath = path.join(
          targetDir,
          `${outputBase}.${actualFormat}`,
        );
        if (!isInside(outputDir, outputPath)) {
          throw new Error(
            `refusing to write outside ${relPath(outputDir)}: ${outputPath}`,
          );
        }
        outputs.push({
          path: outputPath,
          format: actualFormat,
          size,
          crop: variant.crop,
        });
      }
    }
  }

  return outputs;
}

/* Region of an auto-oriented source covered by `crop`: the largest box with
   the crop's aspect ratio, centered on its horizontal focus point and clamped
   to the frame, vertically centered when the width is the limit. */
async function cropRegion(buffer, crop) {
  const meta = await sharp(buffer).metadata();
  const swapped = (meta.orientation || 1) >= 5;
  const sourceWidth = swapped ? meta.height : meta.width;
  const sourceHeight = swapped ? meta.width : meta.height;
  const ratio = crop.aspect.width / crop.aspect.height;

  let width = Math.round(sourceHeight * ratio);
  let height = sourceHeight;
  if (width > sourceWidth) {
    width = sourceWidth;
    height = Math.round(sourceWidth / ratio);
  }

  const left = Math.min(
    sourceWidth - width,
    Math.max(0, Math.round(sourceWidth * crop.focusX - width / 2)),
  );
  const top = Math.round((sourceHeight - height) / 2);
  return { left, top, width, height };
}

async function buildForFile(filePath, outputs, { force = false } = {}) {
  const pending = [];
  for (const output of outputs) {
    const exists = await pathExists(output.path);
    if (exists && !force) {
      continue;
    }
    pending.push({ ...output, exists });
  }

  if (pending.length === 0) {
    return pending;
  }

  const buffer = await fs.readFile(filePath);
  const regions = new Map();

  for (const output of pending) {
    await ensureDir(path.dirname(output.path));

    let pipeline = sharp(buffer).rotate();
    if (output.crop) {
      if (!regions.has(output.crop)) {
        regions.set(output.crop, await cropRegion(buffer, output.crop));
      }
      pipeline = pipeline.extract(regions.get(output.crop));
    }
    if (output.size) {
      pipeline = pipeline.resize(output.size.width, output.size.height, {
        fit: "cover",
        position: "center",
      });
    }

    if (output.format === "avif") {
      pipeline = pipeline.avif(QUALITY.avif);
    } else if (output.format === "webp") {
      pipeline = pipeline.webp(QUALITY.webp);
    } else if (output.format === "jpg" || output.format === "jpeg") {
      pipeline = pipeline.jpeg(QUALITY.jpg);
    } else if (output.format === "png") {
      pipeline = pipeline.png();
    }

    await pipeline.toFile(output.path);
  }

  return pending;
}

/* Removes subdirectories of an owned directory that pruning has left empty,
   such as a deleted gallery category. The owned directory itself stays. */
async function removeEmptyDirs(dir, ownedDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let empty = true;
  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      (await removeEmptyDirs(path.join(dir, entry.name), ownedDir))
    ) {
      continue;
    }
    empty = false;
  }
  if (empty && dir !== ownedDir) {
    await fs.rmdir(dir);
    return true;
  }
  return false;
}

/* Converges the owned output directories to `expected` by deleting everything
   else inside them. Cleanup is therefore driven by what the configuration can
   currently generate rather than by filename guesswork, so outputs left behind
   by superseded naming, sizing, or directory rules cannot survive another
   cycle. */
async function pruneObsolete(ownedDirs, expected, { dryRun = false } = {}) {
  const obsolete = [];

  for (const ownedDir of ownedDirs) {
    if (!isInside(OUT_ROOT, ownedDir)) {
      throw new Error(`refusing to prune outside ${OUT_ROOT}: ${ownedDir}`);
    }
    if (!(await pathExists(ownedDir))) {
      continue;
    }

    for (const filePath of await walk(ownedDir)) {
      if (expected.has(filePath)) {
        continue;
      }
      if (!isInside(ownedDir, filePath)) {
        throw new Error(`refusing to delete outside ${ownedDir}: ${filePath}`);
      }
      obsolete.push(filePath);
      if (!dryRun) {
        await fs.unlink(filePath);
      }
    }

    if (!dryRun) {
      await removeEmptyDirs(ownedDir, ownedDir);
    }
  }

  return obsolete.sort();
}

/* Resolves every source of the selected groups to its outputs before anything
   is written, so a run either has one source per output path or stops without
   touching the disk. Paths are compared case-insensitively because bathr-01.jpg
   and Bathr-01.png name the same output files on Windows and macOS. */
async function plan(groups, mode) {
  const sources = [];
  const expected = new Set();
  const claims = new Map();
  const ownedDirs = [];
  let scanned = 0;

  for (const config of groups) {
    const inputDir = path.join(SRC_ROOT, config.inputDir);
    if (!(await pathExists(inputDir))) {
      /* Without its sources the canonical set for this group is unknowable, so
         its output directory is left alone instead of being emptied. */
      logger.debug(
        `images:${mode} skip missing input directory ${config.inputDir}`,
      );
      continue;
    }

    logger.debug(`images:${mode} scanning ${config.inputDir}`);
    ownedDirs.push(path.join(OUT_ROOT, config.outputDir));

    for (const filePath of await walk(inputDir)) {
      scanned += 1;
      /* "clean" keeps nothing, so it contributes no expected outputs and the
         prune empties every selected owned directory. */
      if (mode !== "build") {
        continue;
      }

      const outputs = expectedOutputsForFile(filePath, config);
      for (const output of outputs) {
        const key = output.path.toLowerCase();
        const claimedBy = claims.get(key);
        if (claimedBy) {
          throw new Error(
            `output collision: ${relPath(output.path)} would be produced by both ${relPath(claimedBy)} and ${relPath(filePath)}`,
          );
        }
        claims.set(key, filePath);
        expected.add(output.path);
      }
      if (outputs.length > 0) {
        sources.push({ filePath, outputs });
      }
    }
  }

  return { sources, expected, ownedDirs, scanned };
}

async function run(mode, { dryRun = false, force = false, groups = CONFIG }) {
  const scope =
    groups.length === CONFIG.length
      ? ""
      : ` in group(s) ${groups.map((config) => config.name).join(", ")}`;

  logger.debug(
    `images:${mode} started${scope}${force ? " (force)" : ""}${dryRun ? " (dry run)" : ""}`,
  );

  const { sources, expected, ownedDirs, scanned } = await plan(groups, mode);

  let toWrite = 0;
  let created = 0;
  let regenerated = 0;

  for (const { filePath, outputs } of sources) {
    if (dryRun) {
      for (const output of outputs) {
        if (force || !(await pathExists(output.path))) {
          toWrite += 1;
          logger.debug(`+ ${relPath(output.path)}`);
        }
      }
      continue;
    }

    const written = await buildForFile(filePath, outputs, { force });
    if (written.length > 0) {
      logger.debug(
        `images:build wrote ${written.length} output(s) from ${relPath(filePath)}`,
      );
    }
    for (const output of written) {
      if (output.exists) {
        regenerated += 1;
      } else {
        created += 1;
      }
    }
  }

  const obsolete = await pruneObsolete(ownedDirs, expected, { dryRun });
  for (const filePath of obsolete) {
    if (dryRun) {
      logger.log(`- ${relPath(filePath)}`);
    } else {
      logger.debug(
        `images:${mode} removed obsolete output ${relPath(filePath)}`,
      );
    }
  }

  if (dryRun) {
    const writes = mode === "build" ? ` and ${toWrite} output(s) to write` : "";
    logger.summary(
      `OK: images:${mode} --dry-run found ${obsolete.length} obsolete output(s)${writes} across ${ownedDirs.length} pipeline-owned directory(ies) from ${scanned} scanned source file(s)${scope}.`,
    );
  } else if (mode === "build") {
    logger.summary(
      `OK: images:build created ${created} file(s), regenerated ${regenerated} existing file(s) and removed ${obsolete.length} obsolete file(s) from ${scanned} scanned source file(s)${scope}.`,
    );
  } else if (mode === "clean") {
    logger.summary(
      `OK: images:clean removed ${obsolete.length} file(s) from ${scanned} scanned source file(s)${scope}.`,
    );
  }
}

function parseArgs(args) {
  const mode = args.find((arg) => !arg.startsWith("-"));
  if (!mode || !["build", "clean"].includes(mode)) {
    throw new Error(USAGE);
  }

  const force = args.includes("--force");
  if (force && mode !== "build") {
    throw new Error(`--force applies to build only.\n${USAGE}`);
  }

  let groups = CONFIG;
  const onlyArg = args.find((arg) => arg.startsWith("--only="));
  if (onlyArg) {
    const names = onlyArg
      .slice("--only=".length)
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    const unknown = names.filter((name) => !GROUP_NAMES.includes(name));
    if (names.length === 0 || unknown.length > 0) {
      throw new Error(
        `Unknown image group(s): ${unknown.join(", ") || "(none given)"}. Known groups: ${GROUP_NAMES.join(", ")}.\n${USAGE}`,
      );
    }
    groups = CONFIG.filter((config) => names.includes(config.name));
  }

  return { mode, dryRun: args.includes("--dry-run"), force, groups };
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  logger.error(error.message);
  process.exit(1);
}

run(options.mode, options).catch((error) => {
  logger.error("FAIL: image processing failed.");
  logger.error(error.stack || String(error));
  process.exit(1);
});
