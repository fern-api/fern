const packageJson = require("./package.json");
const tsup = require('tsup');
const { writeFile } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ['src/index.ts'],
        format: ['cjs'],
        minify: true,
        dts: true,
        outDir: 'dist',
        external: [
            // Test dependencies should not be included in the published package.
            '@fern-api/go-formatter',
            '@fern-api/project-loader',
            '@fern-api/workspace-loader'
        ]
    });

    process.chdir(path.join(__dirname, "dist"));

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                files: ["index.cjs"],
            },
            undefined,
            2
        )
    );
}