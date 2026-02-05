import { build } from "tsdown";

main();

async function main() {
    await build({
        entry: ["src/cli.ts", "src/api.ts"],
        format: ["cjs"],
        dts: true,
        // Bundle all workspace dependencies to avoid ESM resolution issues
        noExternal: ["@fern-api/fs-utils", "@fern-api/github"],
        minify: false,
        sourcemap: false,
        outDir: "dist",
        clean: true
    });
}
