import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import semver from "semver";

export type State = "verified" | "invalid" | "unavailable" | "not-checked";
export interface Diagnostic {
  check: string;
  state: State;
  code: string;
  message: string;
  nextAction: string;
}
export interface Report {
  schemaVersion: 1;
  evidence: "local-offline" | "test-only";
  exitCode: 0 | 1;
  diagnostics: Diagnostic[];
}
interface Options {
  platform: "android" | "ios";
  root: string;
  app: string;
}
interface FileKind {
  isFile(): boolean;
  isDirectory(): boolean;
}
export interface Probes {
  nodeVersion: string;
  host: string;
  metadata(): Promise<unknown>;
  realpath(path: string): Promise<string>;
  stat(path: string): Promise<FileKind>;
}
// The supported workspace contract. The preflight verifies the manifest still
// declares exactly this, so these are deliberately not read from package.json.
const supportedNode = ">=22.19.0";
const supportedPackages = {
  appium: ">=3 <4",
  "@wdio/cli": ">=10 <11",
  typescript: ">=5.9 <6",
  tsx: ">=4 <5",
} as const;
const packages = Object.keys(
  supportedPackages,
) as (keyof typeof supportedPackages)[];
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const remote = (path: string) =>
  /^(?:[a-z][a-z0-9+.-]*:\/\/|(?:https?|ftp|file|smb|data):|[/\\]{2})/i.test(
    path,
  ) && !/^[a-z]:[/\\]/i.test(path);
const contained = (root: string, path: string) => {
  const child = relative(root, path);
  return (
    child !== "" &&
    child !== ".." &&
    !child.startsWith(`..${sep}`) &&
    !isAbsolute(child)
  );
};

async function readMetadata(path: string): Promise<unknown> {
  if ((await realpath(path)) !== path) return null;
  const info = await stat(path);
  if (!info.isFile() || info.size > 2_000_000) {
    return null;
  }
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

export function localProbes(workspace: string): Probes {
  return {
    nodeVersion: process.versions.node,
    host: process.platform,
    realpath,
    stat,
    async metadata() {
      const canonicalWorkspace = await realpath(workspace);
      const manifest = await readMetadata(
        resolve(canonicalWorkspace, "package.json"),
      );
      const lock = await readMetadata(
        resolve(canonicalWorkspace, "package-lock.json"),
      );
      const installed: Record<string, unknown> = {};
      for (const name of packages) {
        installed[name] = await readMetadata(
          resolve(canonicalWorkspace, "node_modules", name, "package.json"),
        );
      }
      return { manifest, lock, installed };
    },
  };
}

export function wantsJson(args: readonly string[]): boolean {
  return args.includes("--json");
}

const flags = {
  platform: { type: "string" },
  "app-root": { type: "string" },
  app: { type: "string" },
  json: { type: "boolean" },
} as const;

const parseErrors: Record<string, string> = {
  ERR_PARSE_ARGS_INVALID_OPTION_VALUE: "VALUE_MISSING",
  ERR_PARSE_ARGS_UNKNOWN_OPTION: "OPTION_UNKNOWN",
  ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL: "OPTION_UNKNOWN",
};

const controlCharacter = /\p{Cc}/u;

function parse(args: readonly string[]): Options | string {
  if (args.length > 16) return "OPTIONS_INVALID";
  let tokens;
  try {
    ({ tokens } = parseArgs({
      args: [...args],
      options: flags,
      strict: true,
      tokens: true,
    }));
  } catch (error) {
    const code = record(error) ? String(error.code) : "";
    return parseErrors[code] ?? "OPTIONS_INVALID";
  }
  const values = new Map<string, string>();
  const seen = new Set<string>();
  for (const token of tokens) {
    // Only the exact `--flag value` form is accepted: no `--flag=value`, no `--`.
    if (token.kind !== "option" || token.inlineValue) return "OPTION_UNKNOWN";
    if (seen.has(token.name)) return "OPTION_CONFLICT";
    seen.add(token.name);
    if (token.name === "json") continue;
    const value = token.value;
    if (!value) return "VALUE_MISSING";
    if (value.length > 4096 || controlCharacter.test(value))
      return "VALUE_INVALID";
    values.set(token.name, value);
  }
  const platform = values.get("platform");
  const root = values.get("app-root");
  const app = values.get("app");
  if (!platform || !root || !app) return "VALUE_MISSING";
  if (platform !== "android" && platform !== "ios")
    return "PLATFORM_UNSUPPORTED";
  return { platform, root, app };
}

export async function preflight(
  args: readonly string[],
  workspace: string,
  injected?: Probes,
): Promise<Report> {
  const diagnostics: Diagnostic[] = [];
  const add = (
    check: string,
    state: State,
    code: string,
    message: string,
    nextAction: string,
  ) => diagnostics.push({ check, state, code, message, nextAction });
  const options = parse(args);
  const probes = injected ?? localProbes(workspace);
  if (typeof options === "string") {
    add(
      "inputs",
      "invalid",
      options,
      "Explicit options are missing, invalid or ambiguous.",
      "Use --platform android|ios --app-root <owned-directory> --app <local-path>; optionally --json.",
    );
    for (const check of ["runtime", "dependencies", "host", "app-path"])
      add(
        check,
        "not-checked",
        "INPUTS_REQUIRED",
        "Not checked because inputs failed.",
        "Correct the explicit options and rerun.",
      );
  } else {
    add(
      "inputs",
      "verified",
      "INPUTS_VALID",
      "Explicit options are valid.",
      "None for this offline check.",
    );
    await checkMetadata(probes, add);
    if (options.platform === "ios" && probes.host !== "darwin") {
      add(
        "host",
        "invalid",
        "IOS_HOST_UNSUPPORTED",
        "iOS execution requires macOS.",
        "Use a macOS host with separately verified Apple tooling; do not download tooling here.",
      );
    } else {
      add(
        "host",
        "verified",
        "HOST_VALID",
        "Host platform prerequisite is valid.",
        "Verify native tooling separately before any execution.",
      );
    }
    await checkApp(options, probes, add);
  }
  for (const [check, action] of [
    [
      "native-tooling",
      "Verify SDK/JDK or Xcode separately on the intended execution host.",
    ],
    [
      "driver",
      "Verify installed driver compatibility separately before execution.",
    ],
    [
      "device",
      "Verify the intended device or simulator separately before execution.",
    ],
    [
      "application-execution",
      "Review and run tests against the target app separately with authorization.",
    ],
  ])
    add(
      check,
      "not-checked",
      "NOT_VERIFIED",
      "NOT VERIFIED: no execution probe was performed.",
      action,
    );
  return {
    schemaVersion: 1,
    evidence: injected ? "test-only" : "local-offline",
    exitCode: diagnostics.some(
      ({ state }) => state === "invalid" || state === "unavailable",
    )
      ? 1
      : 0,
    diagnostics,
  };
}

type Add = (
  check: string,
  state: State,
  code: string,
  message: string,
  action: string,
) => void;

function metadataFailure(
  add: Add,
  state: "invalid" | "unavailable",
  message: string,
  action: string,
) {
  add(
    "dependencies",
    state,
    state === "invalid" ? "METADATA_INVALID" : "METADATA_UNAVAILABLE",
    message,
    action,
  );
  add(
    "runtime",
    "not-checked",
    "METADATA_REQUIRED",
    "Node compatibility was not checked.",
    "Restore required metadata and rerun.",
  );
}

async function checkMetadata(probes: Probes, add: Add) {
  let metadata: unknown;
  try {
    metadata = await probes.metadata();
  } catch (error) {
    const state = error instanceof SyntaxError ? "invalid" : "unavailable";
    metadataFailure(
      add,
      state,
      "Required local dependency metadata could not be checked.",
      "Restore the repository manifest, lockfile and locked dependencies in a separate setup step.",
    );
    return;
  }
  if (
    !record(metadata) ||
    !record(metadata.manifest) ||
    !record(metadata.lock) ||
    !record(metadata.installed) ||
    !record(metadata.manifest.engines) ||
    typeof metadata.manifest.engines.node !== "string" ||
    !record(metadata.manifest.devDependencies) ||
    !record(metadata.lock.packages)
  ) {
    metadataFailure(
      add,
      "invalid",
      "Required dependency metadata is malformed.",
      "Restore the repository manifest and lockfile.",
    );
    return;
  }
  const range = metadata.manifest.engines.node;
  // Only the current supported workspace contract is accepted, not an invented range.
  const runtimeValid =
    range === supportedNode &&
    semver.valid(probes.nodeVersion) !== null &&
    semver.satisfies(probes.nodeVersion, range);
  add(
    "runtime",
    runtimeValid ? "verified" : "invalid",
    runtimeValid ? "NODE_VALID" : "NODE_INCOMPATIBLE",
    runtimeValid
      ? "Node satisfies the supported workspace range."
      : "Node or its supported range is incompatible.",
    `Use the repository-supported Node version (${supportedNode}).`,
  );
  const declared = metadata.manifest.devDependencies;
  const locked = metadata.lock.packages;
  const installed = metadata.installed;
  const rootLock = metadata.lock.packages[""];
  const dependenciesValid =
    record(rootLock) &&
    record(rootLock.devDependencies) &&
    packages.every((name) => {
      const version = declared[name];
      const entry = locked[`node_modules/${name}`];
      const actual = installed[name];
      return (
        typeof version === "string" &&
        semver.valid(version) !== null &&
        record(entry) &&
        record(actual) &&
        record(rootLock.devDependencies) &&
        rootLock.devDependencies[name] === version &&
        entry.version === version &&
        actual.version === version &&
        semver.satisfies(version, supportedPackages[name])
      );
    });
  add(
    "dependencies",
    dependenciesValid ? "verified" : "invalid",
    dependenciesValid ? "DEPENDENCIES_VALID" : "DEPENDENCIES_INCOMPATIBLE",
    dependenciesValid
      ? "Declared, locked and installed dependency versions agree."
      : "Required dependency versions are unsupported, malformed or conflicting.",
    "Restore the reviewed locked workspace; do not install mobile tools through preflight.",
  );
}

async function checkApp(options: Options, probes: Probes, add: Add) {
  const fail = (state: State, code: string, message: string) => {
    add(
      "app-path",
      state,
      code,
      message,
      "Select an accessible owned local .apk file or .app directory under --app-root.",
    );
  };
  if (remote(options.root) || remote(options.app)) {
    fail(
      "invalid",
      "APP_REMOTE",
      "Remote app paths and roots are not permitted.",
    );
    return;
  }
  const root = resolve(options.root);
  const app = resolve(root, options.app);
  if (!contained(root, app)) {
    fail(
      "invalid",
      "APP_OUTSIDE_ROOT",
      "App path must be inside the explicit root.",
    );
    return;
  }
  if (!app.endsWith(options.platform === "android" ? ".apk" : ".app")) {
    fail(
      "invalid",
      "APP_FORMAT",
      "App path has an unsupported platform suffix.",
    );
    return;
  }
  try {
    const canonicalRoot = await probes.realpath(root);
    if (!(await probes.stat(canonicalRoot)).isDirectory()) {
      fail("invalid", "APP_ROOT_KIND", "App root must be a directory.");
      return;
    }
    const canonicalApp = await probes.realpath(app);
    if (!contained(canonicalRoot, canonicalApp)) {
      fail(
        "invalid",
        "APP_SYMLINK_ESCAPE",
        "Canonical app path escapes the explicit root.",
      );
      return;
    }
    const kind = await probes.stat(canonicalApp);
    if (options.platform === "android" ? !kind.isFile() : !kind.isDirectory()) {
      fail(
        "invalid",
        "APP_KIND",
        "App path is not the expected file or directory kind.",
      );
      return;
    }
    add(
      "app-path",
      "verified",
      "APP_PATH_VALID",
      "Local app path containment and kind are valid; contents were not inspected.",
      "Verify app validity, signing, installation and behavior separately.",
    );
  } catch (error) {
    const missing =
      record(error) && (error.code === "ENOENT" || error.code === "ENOTDIR");
    fail(
      missing ? "invalid" : "unavailable",
      missing ? "APP_MISSING" : "APP_UNAVAILABLE",
      missing
        ? "App path or root does not exist."
        : "App path metadata is unavailable.",
    );
  }
}

export function render(report: Report, json: boolean): string {
  if (json) return JSON.stringify(report);
  return [
    `Offline mobile setup: ${report.exitCode === 0 ? "PASS" : "FAIL"} (${report.evidence})`,
    "Only required offline checks; this is not mobile readiness or a passed mobile test.",
    ...report.diagnostics.map(
      (d) =>
        `[${d.state}] ${d.check} ${d.code}: ${d.message} Next: ${d.nextAction}`,
    ),
  ].join("\n");
}
