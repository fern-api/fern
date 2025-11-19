import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/cli.ts"],
    format: ["cjs"],
    // Bundle ALL dependencies including workspace packages
    noExternal: [/@fern-api\/.*/, /dedent/],
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: true
});
