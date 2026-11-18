// Test classification: unit
// Review status: Not Reviewed
// Evidence: synthetic
// Scope: Parses .github/workflows/pr.yml and checks its run steps install with lifecycle scripts disabled and then run the offline checks; it does not run the workflow.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

interface Workflow {
  jobs: Record<string, { steps: { run?: string }[] }>;
}

test("pull request CI disables dependency lifecycle scripts and runs the offline checks explicitly", () => {
  const workflow = parse(
    readFileSync(resolve(__dirname, "../../.github/workflows/pr.yml"), "utf8"),
  ) as Workflow;
  // Any change to these commands needs a deliberate review rather than
  // silently weakening install safety.
  const commands = Object.values(workflow.jobs).flatMap(({ steps }) =>
    steps.flatMap(({ run }) => (run === undefined ? [] : [run.trim()])),
  );
  assert.deepEqual(commands, [
    "npm ci --ignore-scripts",
    "npm run check:offline",
  ]);
});
