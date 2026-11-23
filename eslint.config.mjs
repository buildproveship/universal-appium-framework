// ESLint: the shared @buildproveship/config rules (type-aware through the TypeScript project service).
import { releaseready } from "@buildproveship/config/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  releaseready({ tsconfigRootDir: import.meta.dirname }),
  // App binaries are local-only build output.
  { ignores: ["apps/**"] },
);
