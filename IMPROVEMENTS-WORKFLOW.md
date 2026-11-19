# SolidCraft — Workflow Improvements

**Analysis date:** 2026-11-17
**Project type:** Static multi-page website (vanilla HTML, CSS, and JavaScript) with Node.js build and QA tooling, Netlify deployment configuration, and one GitHub Actions workflow
**Analysis mode:** Evidence-based workflow improvement review
**Focus:** Project-wide workflow

## Improvement overview

SolidCraft has a mature, well-documented workflow: a deterministic `build:dist` pipeline with self-verifying steps, a single canonical tooling document (`docs/settings.md`), a dependency-free dev server, project-owned Playwright harnesses, and a deliberately small CI gate that invokes npm scripts instead of reproducing them. No build-system, deployment, or CI restructuring is warranted.

The remaining opportunities are narrow: tooling facts are maintained in three places despite the single-source-of-truth rule and have started to drift; one existing verification gate (`qa:sw`) sits outside both the canonical documentation and CI; formatting coverage skips the `.mjs` tooling scripts; the fixed dev-server port conflicts with the project's parallel-worktree practice; and the `watch:*` scripts have been superseded by the dev server.

## Proposed improvements

### IMP-WORKFLOW-01 — Make `docs/settings.md` the only owner of tooling and QA detail

- **Status:** COMPLETED — implemented and verified.
- **Result:** The PL and EN README sections now keep only the install, dev, production-build, and pre-deploy commands with links to `docs/settings.md`, and the project tree is reduced to current directories and root files. `docs/settings.md` now describes the actual `qa:functional` scenario groups and `qa:a11y` routes and absorbs the Lighthouse routes and thresholds previously documented only in the README.
- **Verification:** Prettier 3.3.3 `-c` on both Markdown files and `git diff --check` passed; README commands match `package.json`, relative links and tree entries resolve, and the PL and EN sections have matching heading sets. The `qa:sw` description in the README PWA section is unchanged because its documentation in `docs/settings.md` belongs to IMP-WORKFLOW-02.
- **Impact:** High
- **Effort:** Medium

### IMP-WORKFLOW-02 — Bring `qa:sw` into the documented and automated verification contract

- **Status:** COMPLETED — implemented and verified.
- **Result:** CI runs `npm run qa:sw` as a separate step after `qa:functional`, reusing the existing Chromium install, with the workflow, job, triggers, permissions, runner, Node setup, concurrency, timeout, and prior steps unchanged. `docs/settings.md` documents `qa:sw` in its Scripts, QA / Validation, and CI sections and distinguishes tests of the canonical `sw.js` logic from validation of the generated `dist/sw.js`. The README PWA sections now link there.
- **Verification:** A local `npm run qa:sw` run passed all 9 scenarios in about 60 s; the CI YAML step order and commands were inspected, and Prettier 3.3.3 `-c` on the modified Markdown files and `git diff --check` passed. No GitHub Actions run of the updated workflow has been inspected.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Extend Prettier coverage to the `.mjs` tooling scripts

- **Status:** COMPLETED — implemented and verified.
- **Result:** Both formatting scripts now include `.mjs`, and the five scripts with confirmed deviations were formatted with Prettier 3.3.3 without semantic changes. `docs/settings.md` lists the supported extensions; CI and `.prettierignore` remain unchanged.
- **Verification:** All 17 tracked `.mjs` files, `npm run format:check`, `npm run build`, `npm run check:predeploy` (28 accessibility scans), and `git diff --check` passed; formatter-output and normalized-AST comparisons confirmed formatting-only changes. `npm run qa:functional` passed all 35 scenarios on a serial rerun after one initial anti-spam setup timing failure. Browser checks required execution outside the sandbox with existing Chromium; link validation skipped 11 external references returning HTTP 403.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-04 — Allow a per-session dev-server port for parallel worktrees

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added optional `DEV_SERVER_PORT` validation for decimal ports from 1 through 65535, preserving the default `127.0.0.1:15500` and immediate failure without fallback for invalid or occupied ports. `docs/settings.md` documents configuration and parallel-session examples.
- **Verification:** HTTP checks passed for the default port, a custom port, two concurrent source roots, boundary ports, and leading zeros; 17 invalid values and conflicts on both selected ports exited with code 1. Shared partial rendering, partial updates, SSE reload/CSS refresh, `DEV_SERVER_NO_OPEN=1`, and graceful test-process shutdown passed outside the sandbox, which blocked loopback connections. Node syntax, focused Prettier checks, and `git diff --check` passed; no browser UI or production build was tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-05 — Retire the superseded `watch:css` and `watch:js` scripts

- **Status:** COMPLETED — implemented and verified.
- **Result:** Removed the obsolete npm watch scripts and their tooling documentation. `npm run dev` remains the supported local workflow.
- **Verification:** Manifest comparison confirmed that only the two scripts were removed, and active tooling and workflow documentation had no remaining references. The dev smoke test confirmed HTTP responses, partial rendering, source assets, and the live-reload endpoint on loopback outside the sandbox. `npm run build:dist`, focused Prettier checks, and `git diff --check` passed.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The proposals target documentation ownership (01), verification coverage (02, 03), local development ergonomics for the parallel-worktree practice (04), and command-set clarity (05). All five preserve the existing stack, the Netlify `dist/` deployment model, the CI naming contract, and the `npm run` entry points.

All five can be implemented independently. Two ordering notes apply: implementing 01 first means 02, 04, and 05 update only `docs/settings.md` instead of three documents, and 05 removes README paragraphs that 01 would otherwise rewrite. Four proposals are Small and one is Medium, which makes the set suitable as a candidate backlog for focused development work.

No local CI-parity aggregate script was proposed: CI deliberately keeps its gates as separate steps, and the existing scripts already allow focused local runs.

## Analysis limitations

- The only command executed was a read-only `prettier -c "scripts/**/*.mjs"` (Prettier 3.3.3 from the main checkout); `qa:sw`, `format:check`, the build, and the QA suites were not run, so their current pass status and the CI runtime cost of `qa:sw` are unverified.
- CI run history, branch-protection settings, and the Netlify deployment state were not inspected.
- The `watch:js` behaviour on Windows is inferred from `cmd.exe` semantics and was not executed.
- `PLAN.md` and `CONTEXT-PROJECT.md` do not exist, so no approved plan work could be cross-checked beyond the changelog and archived improvement reports.
- Three minor documentation inaccuracies were observed outside the proposals and belong to a separate correction: the `ci.yml:37-38` comment cites `engines` as `">=18"` (actual `">=22.19.0"`), `docs/settings.md:97` names the runner `ubuntu-latest` (actual `ubuntu-24.04`), and `docs/settings.md:78` references `assets/img-src/PROVENANCE.md`, removed in commit `06936bc`.
