import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/cli.ts", "src/api.ts"],
    format: ["cjs"],
    dts: false,
    bundle: true,
    // Bundle all workspace dependencies to avoid ESM resolution issues
    noExternal: ["@fern-api/fs-utils", "@fern-api/github"],
    minify: false,
    sourcemap: false
});
