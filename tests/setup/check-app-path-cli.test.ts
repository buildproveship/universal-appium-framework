// Test classification: integration
// Review status: Not Reviewed
// Evidence: synthetic
// Scope: Runs the check-app-path CLI as a subprocess against synthetic temporary files; it does not inspect real app builds or install anything.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, describe, it } from "node:test";

const script = resolve("scripts/check-app-path.ts");
const tsx = pathToFileURL(require.resolve("tsx")).href;

describe("check-app-path CLI", () => {
  let root: string;
  before(async () => {
    root = await mkdtemp(join(tmpdir(), "app-path-cli-"));
    await writeFile(join(root, "-debug.apk"), "x");
  });
  after(() => rm(root, { recursive: true, force: true }));

  const run = (...args: string[]) =>
    spawnSync(process.execPath, ["--import", tsx, script, ...args], {
      cwd: root,
      encoding: "utf8",
    });

  it("Given a dash-prefixed .apk filename, then it exits 0", () => {
    const result = run("-debug.apk");
    assert.equal(result.status, 0, result.stderr);
  });
  it("Given no argument, then it exits 1 with a not-found message", () => {
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /App not found/);
  });
  it("Given an invalid path, then it exits 1 with the path in the message", () => {
    const result = run("missing.apk");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /App not found: missing\.apk/);
  });
});
