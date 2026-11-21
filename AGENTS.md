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

The full list is in the code-quality skill: <https://github.com/releaseready/config/tree/main/skill/releaseready-code-quality>.
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
