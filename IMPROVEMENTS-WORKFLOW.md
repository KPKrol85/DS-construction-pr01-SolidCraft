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

- **Affected workflow:** Local development setup.
- **Evidence:** `scripts/dev-server.mjs:31`, `scripts/dev-server.mjs:331-340`, `scripts/dev-server.mjs:348`; `.gitignore` (`.claude/`, `.codex/`); `docs/settings.md:116-117`; `scripts/utils/static-server.mjs:1-11`; `git worktree list` (9 `.claude` and 4 `.codex` worktrees).
- **Current workflow:** The dev server binds the hard-coded port `15500` and exits with an error when it is in use. The project routinely works in parallel agent worktrees — the build, sitemap, and HTML checks explicitly skip `.claude/` and `.codex/` — so only one worktree can run `npm run dev` at a time, and the next session must find and stop the other server. The QA harnesses already avoid this by binding ephemeral ports, and the dev server already honours one environment switch (`DEV_SERVER_NO_OPEN`).
- **Proposed improvement:** Let the dev server accept an optional port override through an environment variable consistent with `DEV_SERVER_NO_OPEN`, keeping `15500` as the default and the fail-loud behaviour on conflicts.
- **Expected practical value:** Parallel worktrees can preview their own changes simultaneously without stopping another session's server, while the documented default workflow stays unchanged.
- **Implementation scope:** Edit `scripts/dev-server.mjs` (read and validate the override; include the active port in the conflict message) and document the variable in `docs/settings.md`. Keep the `127.0.0.1` binding, the default port, the `dev`/`start` scripts, and the no-random-port rule.
- **Acceptance criteria:** `npm run dev` without the variable serves on `127.0.0.1:15500` as before; with the variable set, a second instance serves on the given port while the first keeps running; an invalid value or occupied port exits non-zero with a clear message; `docs/settings.md` documents the variable.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-05 — Retire the superseded `watch:css` and `watch:js` scripts

- **Affected workflow:** Local development commands.
- **Evidence:** `package.json:31-32`; `docs/settings.md:24`, `docs/settings.md:30-31`; `README.md:136-141`, `README.md:398-403`; `scripts/dev-server.mjs:40`; `package.json:17`.
- **Current workflow:** The watch scripts rebuild minified assets into `dist/`, but no project command serves `dist/` for manual preview (`qa-lighthouse.mjs` serves it only during an audit), the dev server serves sources directly with live reload and ignores `dist/`, and `build:dist` recreates `dist/` from scratch. The watchers therefore produce output with no consumer in the documented workflow. `watch:js` also chains its two watchers with `&`; npm uses `cmd.exe` on Windows (`script-shell` is unset), where `&` runs sequentially, so the second watcher would not start while the first runs — inferred from shell semantics, not executed.
- **Proposed improvement:** Remove `watch:css` and `watch:js` and their documentation, leaving `npm run dev` as the single local iteration workflow.
- **Expected practical value:** Fewer commands with overlapping responsibilities and no documented workflow whose output cannot be viewed; the platform-dependent `&` chain disappears with it.
- **Implementation scope:** Edit `package.json` scripts, `docs/settings.md`, and the README watch paragraphs. Keep `build`, `build:css`, `build:js`, `build:dist`, and `dev` unchanged; record the script removal in `docs/CHANGELOG.md` if authorized. If the owner prefers to keep the watchers, this proposal should be rejected and the `&` chain handled as a separate defect fix.
- **Acceptance criteria:** `package.json` contains no `watch:*` scripts; neither `docs/settings.md` nor the README references them; `npm run dev` and `npm run build:dist` behave as before.
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
