const packageJson = require("./package.json");
const tsup = require("tsup");
const { writeFile, rename } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ["src/**/*.ts", "!src/__test__"],
        format: ["esm", "cjs"],
        clean: true,
        minify: true,
        dts: true,
        outDir: "dist",
        bundle: true,
        noExternal: [/@fern-api\/.*/],
        external: [
            "@wasm-fmt/ruff_fmt"
        ],
        tsconfig: "./build.tsconfig.json"
    });

    process.chdir(path.join(__dirname, "dist"));

    // The module expects the imports defined in the index.d.ts file.
    await rename("index.d.cts", "index.d.ts");

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                main: "index.cjs",
                types: "index.d.ts",
                files: ["index.cjs", "index.d.ts"],
                dependencies: {
                    // These are just workspace deps so I think we need to bundle them
                    // "@fern-api/core-utils": "workspace:*",
                    // "@fern-api/generator-commons": "workspace:*",
                    // "@fern-fern/ir-sdk": "53.7.0",
                    "@wasm-fmt/ruff_fmt": "^0.6.1"
                }
            },
            undefined,
            2
        )
    );
}
