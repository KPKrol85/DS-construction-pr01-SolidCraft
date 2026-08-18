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

const OFERTA_SIZES = [
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

const CONFIG = [
  {
    name: "hero",
    inputDir: "hero",
    outputDir: "hero",
    sizes: HERO_SIZES,
    nameFor: (baseName, size) => `${baseName}-${size.width}-${size.height}`,
    formats: ["avif", "webp", "jpg"],
  },
  {
    name: "oferta",
    inputDir: "oferta",
    outputDir: "oferta",
    sizes: OFERTA_SIZES,
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

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png"]);

const QUALITY = {
  webp: { quality: 80 },
  avif: { quality: 50, effort: 4 },
  jpg: { quality: 82, mozjpeg: true },
};

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
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

function outputPathFor(outputDir, baseName, format) {
  return path.join(outputDir, `${baseName}.${format}`);
}

function formatLabel(format, sourceExt) {
  if (format === "source") {
    return sourceExt.replace(".", "");
  }
  return format;
}

async function buildForFile(filePath, config) {
  const ext = path.extname(filePath).toLowerCase();
  if (!INPUT_EXTS.has(ext)) {
    return [];
  }

  const baseName = path.basename(filePath, ext);
  const outputDir = path.join(OUT_ROOT, config.outputDir);
  await ensureDir(outputDir);

  const sizes = config.sizes || [null];
  const buffer = await fs.readFile(filePath);
  const outputs = [];

  for (const size of sizes) {
    const outputBase = config.nameFor(baseName, size);
    for (const format of config.formats) {
      const actualFormat = format === "source" ? ext.slice(1) : format;
      const outPath = outputPathFor(outputDir, outputBase, actualFormat);
      if (await pathExists(outPath)) {
        continue;
      }

      let pipeline = sharp(buffer).rotate();
      if (size) {
        pipeline = pipeline.resize(size.width, size.height, {
          fit: "cover",
          position: "center",
        });
      }

      if (actualFormat === "avif") {
        pipeline = pipeline.avif(QUALITY.avif);
      } else if (actualFormat === "webp") {
        pipeline = pipeline.webp(QUALITY.webp);
      } else if (actualFormat === "jpg" || actualFormat === "jpeg") {
        pipeline = pipeline.jpeg(QUALITY.jpg);
      } else if (actualFormat === "png") {
        pipeline = pipeline.png();
      }

      await pipeline.toFile(outPath);
      outputs.push(outPath);
    }
  }

  return outputs;
}

async function cleanForFile(filePath, config) {
  const ext = path.extname(filePath).toLowerCase();
  if (!INPUT_EXTS.has(ext)) {
    return [];
  }

  const baseName = path.basename(filePath, ext);
  const outputDir = path.join(OUT_ROOT, config.outputDir);
  const sizes = config.sizes || [null];
  const removed = [];

  for (const size of sizes) {
    const outputBase = config.nameFor(baseName, size);
    for (const format of config.formats) {
      const actualFormat = format === "source" ? ext.slice(1) : format;
      const outPath = outputPathFor(outputDir, outputBase, actualFormat);
      if (await pathExists(outPath)) {
        await fs.unlink(outPath);
        removed.push(outPath);
      }
    }
  }

  return removed;
}

async function run(mode) {
  const summary = [];
  let scanned = 0;

  logger.debug(`images:${mode} started`);
  for (const config of CONFIG) {
    const inputDir = path.join(SRC_ROOT, config.inputDir);
    if (!(await pathExists(inputDir))) {
      logger.debug(
        `images:${mode} skip missing input directory ${config.inputDir}`,
      );
      continue;
    }

    logger.debug(`images:${mode} scanning ${config.inputDir}`);
    const files = await walk(inputDir);
    for (const filePath of files) {
      scanned += 1;
      if (mode === "build") {
        const outputs = await buildForFile(filePath, config);
        if (outputs.length > 0) {
          logger.debug(
            `images:build created ${outputs.length} output(s) from ${path.relative(PROJECT_ROOT, filePath)}`,
          );
        }
        summary.push(...outputs);
      } else if (mode === "clean") {
        const removed = await cleanForFile(filePath, config);
        if (removed.length > 0) {
          logger.debug(
            `images:clean removed ${removed.length} output(s) from ${path.relative(PROJECT_ROOT, filePath)}`,
          );
        }
        summary.push(...removed);
      }
    }
  }

  if (mode === "build") {
    logger.summary(
      `OK: images:build created ${summary.length} file(s) from ${scanned} scanned source file(s).`,
    );
  } else if (mode === "clean") {
    logger.summary(
      `OK: images:clean removed ${summary.length} file(s) from ${scanned} scanned source file(s).`,
    );
  }
}

const mode = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
if (!mode || !["build", "clean"].includes(mode)) {
  logger.error("Usage: node scripts/images.js <build|clean> [--verbose]");
  process.exit(1);
}

run(mode).catch((error) => {
  logger.error("FAIL: image processing failed.");
  logger.error(error.stack || String(error));
  process.exit(1);
});
