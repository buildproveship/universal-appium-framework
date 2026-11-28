# What CI checks, and how to adopt it

`releaseready-guardrails` and the shared ESLint config ship in `@buildproveship/config` (one source for every repo).
Every repo runs them in `pr.yml`. Merge only when `pr.yml` is green. GitHub enforces this: the buildproveship org is
on GitHub Team, and org rulesets on buildproveship, frontend-ui, test-management and test-data-management require the
`ci` check (`ci / ci` where it comes from the reusable workflow) on a branch up to date with `main`, with no bypass and
no force pushes. config and universal-appium-framework do the same with branch protection (required check `ci`, admins
included). Where a ruleset applies, auto-merge is on: it merges once `ci` passes. Agents may merge their own PR once `ci` is
green (owner decision, 25 Nov 2026).

## Commands

```sh
npx releaseready-guardrails            # every check (what pr.yml runs): static rules, knip, jscpd
npx releaseready-guardrails --static   # the fast file rules only
npx releaseready-guardrails sync       # write this skill and its .claude stub into the repo
npx releaseready-guardrails baseline   # print allow entries for today's findings (reasons left empty)
```

Each repo wraps the first in `npm run check:guardrails` and runs it from its check command. For Python repos,
install the current published `@buildproveship/config` as a dev dependency using
[the package README's registry setup](https://github.com/buildproveship/config#install), commit the resulting
caret range and lockfile, and run `npx releaseready-guardrails` next to ruff, `mypy --strict`, vulture and pip-audit.

## Rules

| Rule                              | Fails on                                                                                                                                                                                                                 | Findings                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `dependency-source`               | git/GitHub/SHA/tarball/URL/`file:`/`link:` specs in any package.json or lockfile; `@buildproveship/*` not `^x.y.z`                                                                                                       | RR-15, TDM-12, UPF-16, FUI-04 |
| `unpublished-internal-dependency` | `@buildproveship/*` from git, a tarball, or a local or `dist/` folder through an `npm:` alias or `overrides`; a lockfile link outside the repo or a release-tarball `resolved`                                           | Nov 2026 review               |
| `tsconfig-private-path`           | tsconfig/jsconfig `paths` targets in `dist/` or `node_modules`                                                                                                                                                           | RR-14, RPT-08, UPF-14         |
| `tsconfig-not-strict`             | `strict`, `noImplicitAny`, `strictNullChecks` … set to `false`                                                                                                                                                           | standard 2                    |
| `build-in-node-modules`           | scripts with `--prefix node_modules/…`, `cd node_modules`, `tsc -p node_modules/…`                                                                                                                                       | TDM-11, RPT-15                |
| `copied-schema-primitive`         | the reference regex anywhere; UUID and 64-hex digest regexes in repos that depend on test-management                                                                                                                     | TM-07, TM-16, TDM-07          |
| `copied-canonical-digest`         | a local `canonical()`, `canonicalJson`, `stableStringify` …                                                                                                                                                              | TM-06, TDM-21                 |
| `copied-jwt-verifier`             | `jwtVerify`, `createRemoteJWKSet`, `jsonwebtoken`, `jwks-rsa`, PyJWT                                                                                                                                                     | TM-18, TDM-06                 |
| `hand-written-archive-parser`     | `inflateRaw`/`inflateRawSync` or a ZIP local-file-header signature in source (use `fflate` or `yauzl`)                                                                                                                   | RR-08                         |
| `copied-wcag-contrast`            | the sRGB luminance coefficients or linearisation constants                                                                                                                                                               | RPT-11                        |
| `runtime-assert`                  | a Python `assert` statement outside test files (removed by `python -O`; use `if not …: raise`)                                                                                                                           | SonarCloud, 20 Nov 2026       |
| `hardcoded-tmp`                   | a literal `"/tmp"` string in non-test source (publicly writable; use `mkdtemp`); allowlistable with a reason, e.g. a path inside a container                                                                             | SonarCloud, 20 Nov 2026       |
| `legacy-marker`                   | `@deprecated`, `legacy`, backwards-compat, compat layer/shim/alias, `shim`, `TODO remove`                                                                                                                                | RR-03, RR-04, TM-11, UPF-01   |
| `skipped-test`                    | `.skip(`, `.todo(`, `xit(`, `{ skip: true }` in test files                                                                                                                                                               | standard 2                    |
| `eslint-rule-off-without-reason`  | a rule set to `off`/`warn`/`0` in eslint.config without a comment on it or above its group                                                                                                                               | UPF-03, UA2-06                |
| `tracked-ds-store`                | a `.DS_Store` in the git index (`git ls-files`), at any depth; untracked or ignored ones pass                                                                                                                            | standard 7                    |
| `tracked-build-output`            | a tracked `dist/` or `build/` folder at any depth (one finding per folder, from `git ls-files`)                                                                                                                          | Nov 2026 review               |
| `oversized-source-file`           | a non-generated source file (JS/TS/Python) over the line limit (default 1,000; `fileLength.maxLines`); `generated/`, `generated.*`, `*.generated.*`, `*.gen.*`, `*.min.js` and `fileLength.generated` globs do not count | Nov 2026 review               |
| `readme-dated-history`            | README headings with a date or a ticket key; "Status as of <date>" lines                                                                                                                                                 | TDM-20, RPT-17, OBS-17        |
| `skill-drift`                     | this skill differs from the published copy; AGENTS.md/CLAUDE.md missing or not pointing here                                                                                                                             | UA2-21                        |
| `unused-allow`                    | an allowlist entry that matches nothing, or whose `max` is higher than today's count                                                                                                                                     | —                             |
| knip                              | unused files, exports, dependencies; unlisted dependencies and binaries                                                                                                                                                  | TDM-17, RPT-19, UA2-04/05     |
| jscpd                             | duplicated JS/TS/Python above 1% (no repo may allow more)                                                                                                                                                                | RR-17, TM-23, UPF-15          |

Shared ESLint (`@buildproveship/config/eslint`), on every JS and TS file:

| Rule                                                     | Fails on                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| `@eslint-community/eslint-comments/require-description`  | an `eslint-disable*` comment without `-- reason`                      |
| `@eslint-community/eslint-comments/no-unlimited-disable` | `/* eslint-disable */` that names no rule                             |
| `@typescript-eslint/ban-ts-comment`                      | `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` without a description |
| `no-only-tests/no-only-tests`                            | `describe.only`, `it.only`, `test.only` …                             |
| `reportUnusedDisableDirectives`                          | a disable comment that no longer suppresses anything                  |

## The allowlist: `releaseready-guardrails.json`

A finding that is correct here (the owning repo defines the primitive; the consumer of compatibility code is named)
goes in the repo's `releaseready-guardrails.json`, never in an inline comment:

```json
{
  "$schema": "./node_modules/@buildproveship/config/guardrails/config.schema.json",
  "allow": [
    {
      "rule": "copied-schema-primitive",
      "path": "src/reference-schema.ts",
      "max": 1,
      "reason": "test-management owns the reference primitive; this is the one definition the schema/v1 export serves"
    }
  ]
}
```

- `reason` is required (at least 20 characters, not "TODO"/"pre-existing"/"baseline"). For legacy code it names the
  current consumer; for a known finding it names the finding ID that tracks its removal.
- `max` makes the entry a ratchet: more findings than `max` fail, fewer ask you to lower it.
- `match` narrows an entry to lines containing that text.
- An entry that matches nothing fails (`unused-allow`), so the list only shrinks.
- jscpd fails above 1% duplication, and no repo can set a higher `jscpd.threshold` (owner decision, 25 Nov 2026,
  RRDSCRUM-662). There is no jscpd ignore list: fix duplication by extracting the shared code. Generated sources (the
  built-in `generated/`, `generated.*`, `*.generated.*`, `*.gen.*`, `*.min.js` globs and `fileLength.generated`) are not
  counted.
- `knip.enabled: false` needs a `reason`.
- `fileLength.maxLines` above 1000 needs a `reason`; each `fileLength.generated` entry is `{ "path": "<glob>", "reason": "<what writes the file>" }`.
  A lower limit needs no reason.

Adding an allowlist entry, raising `max` or a threshold, or turning a rule off is weakening a guard: do it only with
the owner's agreement, and say so in the PR.

## Rules block for AGENTS.md and CLAUDE.md

Every repo's `AGENTS.md` and `CLAUDE.md` carry this block (with the repo's check command):

```markdown
## Code quality (all changes)

Follow `skills/buildproveship-code-quality/SKILL.md` before writing code and before saying a change is done: no legacy
or compatibility code without a named consumer; search npm, the SDK, the framework or the CLI before writing a
helper; import shared code from `@buildproveship/test-management`, TDM `dev-fixtures`, `@buildproveship/config`,
`@buildproveship/ui-web` or `@buildproveship/tokens`, never copy it; depend on published `^` versions only; never weaken
a lint rule, test or guard to go green, and give every disable comment a reason; READMEs describe today's code.
The check command is `<command>`; it runs `npm run check:guardrails`, which `pr.yml` enforces on every PR.
```
