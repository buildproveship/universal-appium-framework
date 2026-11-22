import { stat } from "node:fs/promises";
import { parseArgs } from "node:util";

// Fails (exit 1) unless the path is an Android .apk file or an iOS simulator .app directory.
export async function checkAppPath(path: string): Promise<string | undefined> {
  const info = await stat(path).catch(() => undefined);
  if (!info) return `App not found: ${path}`;
  if (path.endsWith(".apk") && info.isFile()) return undefined;
  if (path.endsWith(".app") && info.isDirectory()) return undefined;
  return `Expected an .apk file or an .app directory: ${path}`;
}

if (require.main === module) {
  const { positionals } = parseArgs({
    // "--" first makes every argument positional, so a path like -debug.apk is not read as an option.
    args: ["--", ...process.argv.slice(2)],
    allowPositionals: true,
  });
  void checkAppPath(positionals[0] ?? "").then((problem) => {
    if (problem) {
      console.error(problem);
      process.exit(1);
    }
  });
}
