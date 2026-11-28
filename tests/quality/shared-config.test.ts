// Test classification: unit
// Review status: Not Reviewed
// Evidence: synthetic
// Scope: Reads wdio.shared.conf.ts, package.json and the workflow folder to check the repo uses the shared dotenv loader and Allure reporter from @buildproveship/config and keeps no local copy of the code-quality caller; it does not run WebdriverIO.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(__dirname, "../..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

test("the WDIO config loads .env and builds the Allure reporter through @buildproveship/config", () => {
  const source = read("wdio.shared.conf.ts");
  assert.match(source, /from "@buildproveship\/config\/dotenv"/);
  assert.match(source, /from "@buildproveship\/config\/allure"/);
  assert.doesNotMatch(source, /dotenv\/config/);
  assert.doesNotMatch(source, /outputDir/);
});

test("dotenv is not a direct dependency: the shared loader brings it", () => {
  const pkg = JSON.parse(read("package.json")) as {
    devDependencies: Record<string, string>;
  };
  assert.equal(pkg.devDependencies.dotenv, undefined);
});

test("there is no per-repo code-quality workflow caller: pr.yml runs the shared checks", () => {
  assert.equal(
    existsSync(resolve(root, ".github/workflows/code-quality.yml")),
    false,
  );
});
