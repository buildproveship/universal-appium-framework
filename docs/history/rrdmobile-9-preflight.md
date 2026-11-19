# RRDMOBILE-9 offline preflight: acceptance trace

Moved verbatim from `docs/mobile-preflight.md` on 18 Nov 2026. This records how
the RRDMOBILE-9 Jira scenarios were evidenced by the custom preflight
(`src/preflight`, `tests/preflight`), which was deleted on 19 Nov 2026 (UA2-01) and replaced by
`npm ls --all`, `engine-strict` and `appium driver doctor`. This is history, not a description
of the current code. See the [mobile setup check](../mobile-setup-check.md) for current usage.

| Jira scenario | Executable evidence in the deleted `tests/preflight/`                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| S01           | Supported Android metadata and actual CLI success; all execution checks remain unverified                                                      |
| S02           | Injected Linux/Windows iOS failure and macOS host-only success                                                                                 |
| S03           | Missing/unknown/duplicate/malformed options, Node semver boundaries, unsupported/conflicting/malformed dependency metadata; CLI negative cases |
| S04           | Remote/outside/sibling paths, missing/wrong-kind fixtures, direct and ancestor symlink escapes, contained symlinks; actual CLI failures        |
| S05           | Actual CLI success/error paths under network/subprocess/write/app-read guards; secret canaries and unchanged fixtures                          |
| S06           | Inaccessible filesystem/metadata doubles, invalid/unavailable/not-checked/verified distinctions, automatic test-only labeling                  |
| S07           | Strict checks, full offline suite and actual CLI; recorded red-to-green regression evidence in the PR                                          |

Done requires all seven offline criteria evidenced, independent review clear, and
the PR merged. Real-device execution remains explicitly unverified even then.
