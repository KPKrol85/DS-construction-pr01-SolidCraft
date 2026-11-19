# SolidCraft — Workflow Improvements

**Analysis date:** 2026-11-17
**Completion date:** 2026-11-19
**Status:** COMPLETED — 5/5 improvements verified.
**Project type:** Static HTML, CSS, and JavaScript website with Node.js tooling, Netlify, and GitHub Actions
**Focus:** Project-wide workflow

## Overview

The review identified five opportunities to simplify development workflows, consolidate documentation, and strengthen automated verification.

All five improvements were implemented and verified without restructuring the existing architecture, production build, deployment workflow, or CI contracts.

## Completed improvements

### IMP-WORKFLOW-01 — Make `docs/settings.md` the only owner of tooling and QA detail

- **Status:** COMPLETED — implemented and verified.
- **Result:** Consolidated tooling and QA details in `docs/settings.md`. Simplified the Polish and English README sections, updated the project tree, and centralized functional, accessibility, and Lighthouse documentation.
- **Verification:** Prettier 3.3.3 and `git diff --check` passed. README commands, relative links, project tree entries, and bilingual heading structures were verified.
- **Impact:** High
- **Effort:** Medium

### IMP-WORKFLOW-02 — Bring `qa:sw` into the documented and automated verification contract

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `npm run qa:sw` to CI after `qa:functional`, reusing the existing Chromium installation. Documented Service Worker verification and distinguished canonical runtime tests from production artifact validation.
- **Verification:** Local `qa:sw` passed 9/9 scenarios. CI configuration, Prettier, and `git diff --check` passed inspection; execution of the updated GitHub Actions workflow was not independently verified.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Extend Prettier coverage to the `.mjs` tooling scripts

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended formatting coverage to `.mjs` and corrected five tooling scripts without semantic changes. Preserved existing CI behavior and `.prettierignore`.
- **Verification:** All 17 `.mjs` files passed Prettier; AST comparison, build, formatting checks, 28 accessibility scans, and `git diff --check` passed. Functional QA passed 35/35 scenarios on rerun after an initial timing failure; 11 external HTTP 403 link checks were skipped.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-04 — Allow a per-session dev-server port for parallel worktrees

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added optional `DEV_SERVER_PORT` support for ports `1–65535`, preserving the default `127.0.0.1:15500` and explicit failure on invalid or occupied ports.
- **Verification:** Default, custom, concurrent, boundary, and invalid-port scenarios passed, including 17 invalid values. Partial rendering, SSE live reload, syntax, Prettier, and `git diff --check` passed; browser UI and production build were not tested for this change.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-05 — Retire the superseded `watch:css` and `watch:js` scripts

- **Status:** COMPLETED — implemented and verified.
- **Result:** Removed obsolete watch commands and their active documentation. Retained `npm run dev` as the supported local development workflow.
- **Verification:** Confirmed removal of both commands without affecting other npm scripts. Development server smoke tests, `npm run build:dist`, Prettier, and `git diff --check` passed; browser reload after file edits was not separately tested.
- **Impact:** Low
- **Effort:** Small

## Completion

**Result:** 5/5 improvements completed.

The workflow now has centralized tooling documentation, expanded CI and formatting coverage, configurable development ports, and fewer redundant commands.

The original technology stack, production build, Netlify deployment configuration, and CI naming contracts remain unchanged.

Verification results are based on the individual implementation tasks; no separate final QA run was performed during document closure.

## Out-of-scope observations

The original review recorded three documentation inconsistencies outside the approved improvement scope:

- An outdated Node.js `engines` requirement in a `.github/workflows/ci.yml` comment.
- A CI runner mismatch between `docs/settings.md` and the workflow configuration.
- A reference in `docs/settings.md` to the previously removed `assets/img-src/PROVENANCE.md`.

These observations were not addressed or reverified as part of this improvement cycle.
