const packageJson = require("./package.json");
const tsup = require('tsup');
const { writeFile, rename } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ['src/**/*.ts', '!src/__test__'],
        format: ['cjs'],
        clean: true,
        minify: true,
        dts: true,
        outDir: 'dist',
        external: [
            // Test dependencies should not be included in the published package.
            '@fern-api/go-formatter',
            '@fern-api/project-loader',
            '@fern-api/workspace-loader'
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
                files: ["index.cjs", "index.d.ts"]
            },
            undefined,
            2
        )
    );
}