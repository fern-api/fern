const tsup = require('tsup');

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