const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");
const path = require("path");
const { chmod, writeFile, mkdir } = require("fs/promises");

const packageJson = require("./package.json");

main();

async function main() {
    const options = {
        platform: "node",
        target: "node14",
        entryPoints: ["./src/cli.ts"],
        outfile: "./dist/bundle.cjs",
        bundle: true,
        external: ["cpu-features"],
        plugins: [pnpPlugin()],
        define: {
            "process.env.CLI_NAME": JSON.stringify("fern-scripts"),
            "process.env.CLI_VERSION": JSON.stringify(packageJson.version)
        }
    };

    await build(options).catch(() => process.exit(1));

    process.chdir(path.join(__dirname, "dist"));

    // write cli executable
    await writeFile(
        "cli.cjs",
        `#!/usr/bin/env node

require("./bundle.cjs");`
    );
    await chmod("cli.cjs", "755");
}
