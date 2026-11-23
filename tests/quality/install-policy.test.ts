// Test classification: unit
// Review status: Not Reviewed
// Evidence: synthetic
// Scope: Parses .github/workflows/pr.yml and .npmrc and checks pull request CI calls the shared workflow with the offline checks while dependency lifecycle scripts stay disabled; it does not run the workflow.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

interface Workflow {
  jobs: { ci: { uses: string; with: Record<string, string> } };
}

test("pull request CI runs the offline checks through the shared workflow, with dependency lifecycle scripts disabled", () => {
  const workflow = parse(
    readFileSync(resolve(__dirname, "../../.github/workflows/pr.yml"), "utf8"),
  ) as Workflow;
  // Any change to these needs a deliberate review rather than silently weakening install safety.
  assert.deepEqual(Object.keys(workflow.jobs), ["ci"]);
  assert.match(
    workflow.jobs.ci.uses,
    /^buildproveship\/config\/\.github\/workflows\/reusable-ci\.yml@[0-9a-f]{40}$/,
  );
  assert.deepEqual(workflow.jobs.ci.with, {
    runner: "ubuntu-24.04",
    "check-command": "npm run check:offline",
  });
  assert.match(
    readFileSync(resolve(__dirname, "../../.npmrc"), "utf8"),
    /^ignore-scripts=true$/m,
  );
});
