import { stat } from "node:fs/promises";

// Fails (exit 1) unless the path is an Android .apk file or an iOS simulator .app directory.
export async function checkAppPath(path: string): Promise<string | undefined> {
  const info = await stat(path).catch(() => undefined);
  if (!info) return `App not found: ${path}`;
  if (path.endsWith(".apk") && info.isFile()) return undefined;
  if (path.endsWith(".app") && info.isDirectory()) return undefined;
  return `Expected an .apk file or an .app directory: ${path}`;
}

if (require.main === module) {
  void checkAppPath(process.argv[2] ?? "").then((problem) => {
    if (problem) {
      console.error(problem);
      process.exit(1);
    }
  });
}
