import { build } from "tsdown";

main();

async function main() {
    await build({
        entry: ["src/cli.ts", "src/api.ts"],
        format: ["cjs"],
        dts: true,
        noExternal: ["@fern-api/fs-utils", "@fern-api/github"],
        inlineOnly: false,
        outputOptions: {
            codeSplitting: false
        },
        minify: false,
        sourcemap: false,
        outDir: "dist",
        clean: true
    });
}
