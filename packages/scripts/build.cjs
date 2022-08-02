const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");
const path = require("path");
const { chmod, writeFile, mkdir } = require("fs/promises");

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
        inject: ["./dist/import-meta-url.js"],
        define: {
            "import.meta.url": JSON.stringify("import_meta_url"),
            "process.env.CLI_NAME": JSON.stringify("fern-scripts"),
        },
    };

    const outputPath = path.join(__dirname, "dist");
    await mkdir(outputPath, { recursive: true });
    process.chdir(outputPath);
    await writeFile("import-meta-url.js", "export var import_meta_url = require('url').pathToFileURL(__filename);");

    await build(options).catch(() => process.exit(1));

    // write cli executable
    await writeFile(
        "cli.cjs",
        `#!/usr/bin/env node

require("./bundle.cjs");`
    );
    await chmod("cli.cjs", "755");
}
