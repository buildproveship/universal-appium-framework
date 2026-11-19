// Test classification: unit
// Review status: Not Reviewed
// Evidence: synthetic
// Scope: Exercises checkAppPath against synthetic temporary files and directories; it does not inspect real app builds or install anything.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { checkAppPath } from "../../scripts/check-app-path";

describe("checkAppPath", () => {
  let root: string;
  before(async () => {
    root = await mkdtemp(join(tmpdir(), "app-path-"));
    await writeFile(join(root, "a.apk"), "x");
    await mkdir(join(root, "b.app"));
    await mkdir(join(root, "dir.apk"));
    await writeFile(join(root, "c.txt"), "x");
  });
  after(() => rm(root, { recursive: true, force: true }));

  it("Given an .apk file, then it passes", async () => {
    assert.equal(await checkAppPath(join(root, "a.apk")), undefined);
  });
  it("Given an .app directory, then it passes", async () => {
    assert.equal(await checkAppPath(join(root, "b.app")), undefined);
  });
  it("Given a missing path, then it fails", async () => {
    assert.match(
      (await checkAppPath(join(root, "none.apk"))) ?? "",
      /not found/,
    );
  });
  it("Given an .apk that is a directory, then it fails", async () => {
    assert.match((await checkAppPath(join(root, "dir.apk"))) ?? "", /Expected/);
  });
  it("Given another extension, then it fails", async () => {
    assert.match((await checkAppPath(join(root, "c.txt"))) ?? "", /Expected/);
  });
});
