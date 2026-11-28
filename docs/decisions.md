# Decisions

Owner decisions that change how this repository is built, checked or released. Newest first.

## 28 November 2026: Appium and driver bumps are device-only

- **Decided by:** the owner's code-review handover (RRDSCRUM-374), recorded here when its device-only condition was documented.
- **Scope:** minor and patch bumps of dev tooling (ESLint, Prettier, TypeScript, types) are checked offline by `pr.yml`. A bump of `appium`, `@wdio/appium-service` or a driver (`uiautomator2`, `xcuitest`) changes how a real session runs, which `pr.yml` cannot see, so it lands only after `npm run test:android` or `npm run test:ios` passes on a device or simulator. Linux offline CI is not iOS proof.
- **Done:** the offline-safe tooling bumps shipped under RRDSCRUM-394; the `appium` bump itself is left for a device run.

## 18 November 2026: light pull request checks in GitHub Actions

- **Decided by:** the owner, choosing "Apply all six (Recommended)" for the cross-repo programme (recommendations 1 and 2).
- **Scope:** `.github/workflows/pr.yml` runs on every pull request to `main`: install, build, lint, typecheck and unit tests (a few minutes). The Appium device suites (Android and iOS) need an app binary and a device or simulator, which this template does not ship, so they stay local (`npm run test:android`, `npm run test:ios`) with no nightly workflow; `.github/workflows/quality.yml` (manual) is replaced by `pr.yml`.
- **Replaces:** the 12 November 2026 decision that routine checks do not run in GitHub Actions (RRDPLAT-44), for this light set only. Everything else stays as that decision set it. The manual code-quality scan workflow was later removed: `pr.yml` already runs the shared checks (RRDSCRUM-421).
- **Tooling:** ESLint, Prettier, the tsconfig base and the Renovate preset come from the shared `@buildproveship/config` package ([buildproveship/config](https://github.com/buildproveship/config)); local overrides carry a comment with their reason.
