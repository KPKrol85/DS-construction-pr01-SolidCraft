const fs = require("fs");
const path = require("path");
const { createLogger } = require("./utils/logger");

const logger = createLogger();
const outputPath = path.join(process.cwd(), "js", "script.min.js");

logger.debug(`verify-js-build: checking ${outputPath}`);

if (!fs.existsSync(outputPath)) {
  logger.error(`Missing JS output: ${outputPath}`);
  process.exit(1);
}

const js = fs.readFileSync(outputPath, "utf8");
const hasImport = /\bimport\s+/m.test(js);
const hasExport = /\bexport\s+/m.test(js);

if (hasImport || hasExport) {
  logger.error(
    "JS build verification failed: 'import' or 'export' found in js/script.min.js",
  );
  process.exit(1);
}

logger.summary("OK: JS build verification passed.");
