# RRDMOBILE-6 mobile quality: status and evidence trace

Moved verbatim from `docs/mobile-quality.md` on 18 Nov 2026. This is the
documentation/traceability record for RRDMOBILE-6 at merged baseline
`25bffeb1b020f593018ada7e4b9011396b8ccf61`; it is history, not a description of
the current code. See [mobile quality and release evidence](../mobile-quality.md)
for current guidance.

## Status at the time of writing

This is the documentation/traceability slice of
[RRDMOBILE-6](https://noisegatemusicstudios.atlassian.net/browse/RRDMOBILE-6),
not completion of that story. It describes merged baseline
`25bffeb1b020f593018ada7e4b9011396b8ccf61`; concurrent scaffold and scenario work
is not included. Acceptance remains in Jira. The
[current mobile handoff](https://noisegatemusicstudios.atlassian.net/wiki/spaces/RRDOCS/pages/1835010)
(version 7, inspected 31 October 2026) supersedes its historical Appium 2 and
active-governance-pilot instructions: mobile execution and governance adoption
remain deferred. This guide grants no installation, device, CI or release approval.

At this baseline, `.github/workflows/quality.yml` declares push/PR checks for
typecheck, lint and formatting after `npm ci`; it does **not** run
`test:setup` or mobile scenarios. Do not infer the workflow's enabled state,
successful hosted runs, required branch checks or security/analysis enforcement
from its YAML or the broader README wording. No hosted run was requested or
started for this slice.

No governance package, tracked Husky setup or shared-helper/API-client dependency
is present in the inspected manifest/tree. This does not inspect a developer's
local Git hooks. Governance adoption remains deferred, with no hook/registry
validation claimed. Before future adoption, obtain the package/policy owner's
review and immutable published source plus platform-approved installation access
where private. Never expose tokens or require a portal account merely to run
standalone checks. RR53's frozen cross-service contract is not established by this
slice; package, contract and compatibility gates remain open.

This documentation slice supplies no clean-install,
device/emulator, hosted-CI, hook/registry or shared-helper compatibility run
results and does not close RRDMOBILE-6.

## Scenario-to-evidence trace

These are the current Jira identifiers, not newly implemented Cucumber tags.
The only merged device feature is `features/app-launch.feature` (`@smoke`).
Its step reads the page object's native hierarchy and asserts that trimmed output
is non-empty. It proves neither a specific expected screen nor product behavior.
No RRDMOBILE-6-tagged executable acceptance exists at this baseline.

| Jira identifier                                           | Current source or documentary contribution                                                                                                   | Missing acceptance evidence                                                                                                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@mobile_quality_S01`                                     | README setup, platform configs and mobile setup check guide; platform limits above                                                           | Clean approved setup, actual supported driver verification and owned smoke-app execution per agreed platform                                                                   |
| `@mobile_quality_S02`                                     | Evidence classes above; the setup check does not verify native tooling beyond `appium driver doctor`; device and execution remain unverified | Apply the same distinction to actual readiness/run reports; static or doubled success must never be reported as a device pass                                                  |
| `@mobile_quality_S03`                                     | Generic hierarchy assertion in `features/step-definitions/app-launch.steps.ts`; preflight has negative input/path cases                      | Reviewed app outcome, relevant executable scenario and controlled regression demonstrating that outcome assertion fails; preflight negatives are not an app-outcome regression |
| `@mobile_quality_S04`                                     | Existing static scripts and three declared workflow check steps                                                                              | Observed failing/passing required checks, agreed security/analysis gates and actual enforcement evidence; no suppressed failures or skipped required scenarios                 |
| `@mobile_quality_S05`                                     | Host/platform limits and prerequisite/recovery guidance in this document                                                                     | Actual requested mobile-run handling on an unsupported runner; no implemented CI device-admission gate is claimed                                                              |
| `@mobile_quality_S06`                                     | Release handoff requirements below                                                                                                           | Exact-revision supported-platform passes, tested builds/profiles, scenario results, compatible contract/helper versions and cleanup evidence                                   |
| `@RRDMOBILE-6-reuse-S01`                                  | Current dependency boundary and future approval prerequisites above                                                                          | Approved maintained helper consumed through documented exports at a reproducible locked revision, rather than a copied implementation                                          |
| `@RRDMOBILE-6-reuse-S02`                                  | Compatibility evidence class above                                                                                                           | Independent supported helper upgrade with real affected standalone/adapter behavior passing and an incompatible example failing                                                |
| `@RRDMOBILE-6-reuse-S03`                                  | Installation access distinguished from runtime access above                                                                                  | When a private dependency is adopted, actual missing-access diagnosis and documented owner action without exposing credentials                                                 |
| `@mobile-governance-S01` through `@mobile-governance-S05` | Historical pilot only; superseded by current deferral                                                                                        | Separate rollout approval and reviewed pinned configuration, real hook examples, lint failures and access evidence; none is adopted or validated here                          |

Keep stable Jira tags when feature owners add executable acceptance. Trace each
requirement to its scenario/test and exact revision/run, distinguishing unit or
contract doubles from device E2E. Do not relabel RRDMOBILE-9 tests or the generic
`@smoke` as all of RRDMOBILE-6. Concurrent unmerged scenario or smoke-test seams
must be evidenced after integration, not credited in this baseline.
