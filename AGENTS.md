# Agent instructions

Read [.github/copilot-instructions.md](.github/copilot-instructions.md) before working in this repository. It holds the shared rules, including tests and classification.

## Code quality (all changes)

Follow `skills/releaseready-code-quality/SKILL.md` before writing code and before saying a change is done: no legacy
or compatibility code without a named consumer; search npm, the SDK, the framework or the CLI before writing a
helper; import shared code from `@releaseready/test-management`, TDM `dev-fixtures`, `@releaseready/config`,
`@releaseready/ui-web` or `@releaseready/tokens`, never copy it; depend on published `^` versions only; never weaken
a lint rule, test or guard to go green, and give every disable comment a reason; READMEs describe today's code.
The check command is `npm run check:offline`; it runs `npm run check:guardrails`, which `pr.yml` enforces on every PR.
