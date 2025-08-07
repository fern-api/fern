const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");
const path = require("path");
const { chmod } = require("fs/promises");

main();

async function main() {
    await build({
        entryPoints: ["./src/**/*.ts"],
        platform: "node",
        target: "node18",
        outdir: "./lib",
        bundle: false,
        plugins: [pnpPlugin()],
        logLevel: "info",
        tsconfig: "./build.tsconfig.json"
    });
}