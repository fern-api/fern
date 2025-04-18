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
        outDir: 'dist',
        external: [
            "@wasm-fmt/ruff_fmt",
        ],
    });
}