# Mobile quality and release evidence

This guide sets out supported platforms, evidence classes, failure recovery and
release handoff requirements for mobile runs. It grants no installation, device,
CI or release approval. The RRDMOBILE-6 ticket status and scenario-to-evidence
trace are in [docs/history](history/rrdmobile-6-mobile-quality.md).

## Setup boundary and supported platforms

Use the existing [setup guide](../README.md#getting-started) for the runner and
[RRDMOBILE-9 offline preflight guide](mobile-preflight.md) for diagnostic flags,
output, failure codes and its own scenario coverage. Do not treat either guide as
an executed run record.

Tool versions are pinned in `package.json` (the single source; do not copy them here). The Node engine is `>=22.19.0`; the README requires
npm 10 or newer. `tsconfig.json` enables strict checking of runner configuration,
steps, source, scripts and tests. The repository name is not an Appium 2 contract.
Driver versions are not pinned in the manifest or lockfile: the existing driver
installation scripts select UiAutomator2 or XCUITest without a version suffix.
Record the actual installed driver version for every execution environment.

| Surface             | Current implemented boundary                                                                                                         | Still required before claiming execution support                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offline diagnostics | Explicit Android `.apk` file or iOS simulator `.app` directory inside an owned local root; metadata/path checks only                 | Supported installed Node/dependencies and an explicitly owned root; offline success never establishes installability or device access                                                                                   |
| Android runner      | `wdio.android.conf.ts` selects UiAutomator2; README requires Android SDK, compatible JDK and configured emulator or connected device | Approved APK, reviewed device selection, actual SDK/JDK/driver versions and a recorded approved emulator/device run; no verified host/OS/device matrix is established here                                              |
| iOS runner          | `wdio.ios.conf.ts` selects XCUITest; README requires macOS and Xcode                                                                 | Approved simulator-compatible app and available simulator, actual Xcode/driver/OS versions and recorded execution; physical-device signing/provisioning and selection are not demonstrated by the generic configuration |
| Linux hosted runner | The checked-in quality workflow uses `ubuntu-latest` for static checks                                                               | No mobile job or approved device access is configured there; Linux Docker is not evidence of iOS simulator support                                                                                                      |

The generic device names and `./apps/your-app.*` paths are examples, not discovered
devices or usable builds. Configuration reads `.env` through the shared WDIO
configuration; preflight does not load it, validate capabilities or gate WDIO.
Preflight's path restrictions must not be attributed to the device runner.
Android configuration sets `autoGrantPermissions: true`, so permitted actions must
cover that behavior before execution. No approved target/build, device profile,
signing/install rights, reset ownership or test-data authority is supplied by this
documentation.

Before any authorized real run, the target owner must approve the exact
non-production build and intended actions, device/profile access, data/account
scope, permission grants and cleanup/reset responsibility. The platform owner must
provide compatible tooling and any required runner access. Use separately approved
setup steps; do not install tools/drivers, start Appium or acquire provider capacity
as a diagnostic fallback. The local runner has no configured central portal or
database dependency; that observation is not acceptance of a standalone service or
optional adapter contract.

## Keep evidence classes separate

With locked dependencies already installed, the existing offline commands are:

```sh
npm run typecheck
npm run lint
npm run format:check
npm run test:preflight
```

These are reproducible checks, not results from this documentation change.
Typecheck, lint and formatting check source properties; none executes an app.
`test:preflight` runs Node test-runner tests with synthetic app paths, injected
probes and a guarded actual CLI harness. Its `local-offline` report does not turn a
synthetic fixture into an installable build; injected probes are `test-only`.
Retain the report's `not-checked`/`NOT_VERIFIED` device boundaries even at exit 0.
The linked preflight guide owns the full diagnostic contract and RRDMOBILE-9
traceability; those tests do not become RRDMOBILE-6 device acceptance.

| Evidence class                      | Record                                                                                                                                       | What it cannot establish                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Local static/offline                | Exact revision, runtime/package versions, command, exit status, safe output and whether inputs/probes were synthetic                         | Native tooling, installed driver usability, device access or app outcomes                                              |
| Real emulator/device                | Exact build identity, platform/profile/toolchain/driver versions, selected scenarios, command, assertion results and session cleanup outcome | Untested platforms, customer permissions outside the run, hosted CI or adapter compatibility                           |
| Hosted CI                           | Actual run URL, tested revision, executed jobs/steps and outcomes                                                                            | A configured workflow alone proves no run or enforcement; static jobs do not certify mobile execution                  |
| Hooks/registry                      | If separately approved later: exact package revision/access source and observed valid/invalid commit outcomes                                | Local hooks are bypassable and not server enforcement; package installation access is not a portal runtime requirement |
| Shared-helper/adapter compatibility | Approved immutable package/contract versions, affected standalone/adapter behavior and an intentionally incompatible case that fails         | No such dependency or compatible joined rehearsal is established by the current manifest or preflight doubles          |

## Failure diagnosis and recovery

| Observation                                               | Safe next action and owner boundary                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Offline input, metadata or app-path failure               | Use the preflight diagnostic's stable code and `nextAction`; correct explicit owned local inputs or have the repository/setup owner reconcile locked dependencies under separate approval. Do not bypass containment or substitute a successful fixture for the intended build.                                          |
| Missing Android SDK/JDK/driver or unavailable device      | Report the exact missing prerequisite and platform/profile as blocked. Ask the platform/target owner to prepare approved access; do not buy a provider, install tooling or contact another device automatically.                                                                                                         |
| iOS requested on Linux/Windows or without Xcode/simulator | Report the unsupported host or missing toolchain precisely. Require a separately approved macOS/Xcode environment and suitable app; do not count an injected macOS probe or Linux Docker as iOS proof.                                                                                                                   |
| Appium/session launch failure                             | Preserve safe error evidence and the exact build/profile/toolchain context. Shared WDIO configuration uses the Appium service to start/stop its server, but this is not cleanup proof for every failure. Verify only the owned session/resource with the approved owner before retrying; never kill unrelated processes. |
| Interrupted run or cleanup uncertain                      | Mark execution incomplete and the resource unavailable for reuse until its owner verifies cleanup. No bounded cancellation, quarantine automation, recovery command or reset procedure is implemented by this guide. RRDMOBILE-3 owns that lifecycle behavior.                                                           |
| Static check or app assertion fails                       | Keep the nonzero failure visible and block the corresponding readiness claim. Diagnose the affected source/scenario; do not weaken assertions, suppress gates, skip required scenarios or bypass hooks to manufacture a pass.                                                                                            |
| Missing registry/hook/contract evidence                   | Report that class as not verified or deferred, naming the package/platform/contract owner action. Do not adopt copied configuration, a local symlink or an unpublished contract assumption as acceptance.                                                                                                                |

The spec reporter writes console results and Allure writes raw `allure-results/`;
no evidence publishing, screenshot sanitization or retention service is configured
here. Ignored `.env`, app binaries, logs and report directories are not an access
control or sanitization mechanism. Inspect output for sensitive paths, hierarchy,
tokens and customer data before sharing; withhold anything that cannot be safely
sanitized. Never commit customer builds, private scenarios, credentials or raw
device artifacts to this public repository.

## Release handoff requirements

A release handoff must identify an exact revision, not merely a branch name, and
include only observed results. Record the approved build version/digest and origin,
platform/OS/device or simulator profile, actual driver and native toolchain
versions, dependency lock identity, applicable helper/contract versions, scenario
tags mapped to tests, commands/run identifiers and each outcome. Explicitly mark
synthetic inputs/doubles, unrun platforms, failed/blocked checks, unsupported cases,
and whether session cleanup was verified. Attach only approved safe evidence;
link hosted runs only when they really executed that revision.

Record setup differences and known recovery limitations, with the owner and
precise prerequisite for every outstanding gate. Do not mark the handoff accepted
until the agreed supported-platform checks have actually passed and the owner has
reviewed the evidence.
