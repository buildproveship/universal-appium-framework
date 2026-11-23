# Agent instructions

Read [.github/copilot-instructions.md](.github/copilot-instructions.md) before working in this repository. It holds the shared rules, including tests and classification.

## Code quality (all changes)

Follow `skills/releaseready-code-quality/SKILL.md` before writing code and before saying a change is done: no legacy
or compatibility code without a named consumer; search npm, the SDK, the framework or the CLI before writing a
helper; import shared code from `@releaseready/test-management`, TDM `dev-fixtures`, `@releaseready/config`,
`@releaseready/ui-web` or `@releaseready/tokens`, never copy it; depend on published `^` versions only; never weaken
a lint rule, test or guard to go green, and give every disable comment a reason; READMEs describe today's code.
The check command is `npm run check:offline`; it runs `npm run check:guardrails`, which `pr.yml` enforces on every PR.

## Defects we don't create

The full list is in the code-quality skill: <https://github.com/buildproveship/config/tree/main/skill/releaseready-code-quality>.
<!-- TODO(RRDSCRUM-438): swap this link for config/docs/defects-we-dont-create.md once it exists. -->

- No legacy or compatibility code without a named consumer.
- Search npm, the SDK, the framework or the CLI before writing a helper.
- Import shared code from the `@releaseready/*` packages; never copy it.
- Depend on published `^` versions of internal packages only (no `file:`, git or exact pins).
- Never weaken a lint rule, test, guard or limit to go green.
- Every disable comment and guardrail allow entry carries a reason.
- Every fix ships a guard that fails the whole class next time.
- Every new or changed piece of logic ships with a classified test.
- No invented selectors, credentials, app behaviour or device capabilities.
- READMEs and docs describe today's code only.
- Never commit secrets, tokens or real data.

## Merging

- Never merge with a red or missing `pr.yml`.
- The owner's local `merge-guard.sh` is the merge gate; this repo's `pr.yml` (`checks` job) is also enforced by branch protection.

## Local hooks and CI

- Husky runs the shared hooks from `@releaseready/config` (`releaseready-hooks`): pre-commit (lint-staged, gitleaks), commit-msg (Jira key) and pre-push (never `main`, rebased, type-check, affected tests). Never use `--no-verify` or `HUSKY=0`.
- `.npmrc` sets `ignore-scripts=true`, so `prepare` does not run on `npm install`: run `npx releaseready-hooks install` once per clone.
- CI is one required check, `ci`, from the reusable workflow in `buildproveship/config`; it runs `npm run check:offline`. Run the same command locally before you push.
- This repo is public, so its workflows run on GitHub-hosted `ubuntu-24.04` (a public repo never uses the self-hosted runner).

## Delivery rules

- Rules for people and agents: [How we work](https://noisegatemusicstudios.atlassian.net/wiki/spaces/RRDOCS/pages/27328513) and [Reuse first](https://noisegatemusicstudios.atlassian.net/wiki/spaces/RRDOCS/pages/27230233).
- Read only the ticket's **Agent brief** first ([template](https://noisegatemusicstudios.atlassian.net/wiki/spaces/RRDOCS/pages/26411190): Goal, Files, Done when, Blocked by/Reuses, Model); history and background are in the comments.
- Before you create a ticket, a branch or a helper, search Jira and the Reuse first list, then extend or link what exists.
- Fetch and rebase on `origin/main` before every push, open draft pull requests, and run the checks locally before CI.
