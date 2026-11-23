# Decisions

Owner decisions that change how this repository is built, checked or released. Newest first.

## 18 November 2026: light pull request checks in GitHub Actions

- **Decided by:** the owner, choosing "Apply all six (Recommended)" for the cross-repo programme (recommendations 1 and 2).
- **Scope:** `.github/workflows/pr.yml` runs on every pull request to `main`: install, build, lint, typecheck and unit tests (a few minutes). The Appium device suites (Android and iOS) need an app binary and a device or simulator, which this template does not ship, so they stay local (`npm run test:android`, `npm run test:ios`) with no nightly workflow; `.github/workflows/quality.yml` (manual) is replaced by `pr.yml`.
- **Replaces:** the 12 November 2026 decision that routine checks do not run in GitHub Actions (RRDPLAT-44), for this light set only. Everything else stays as that decision set it, including the manual code-quality scan workflow.
- **Tooling:** ESLint, Prettier, the tsconfig base and the Renovate preset come from the shared `@releaseready/config` package ([buildproveship/config](https://github.com/buildproveship/config)); local overrides carry a comment with their reason.
