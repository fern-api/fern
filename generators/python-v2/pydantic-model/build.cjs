const tsup = require('tsdown');

main();

async function main() {
    await tsup.build({
        entry: ['src/**/*.ts', '!src/__test__'],
        format: ['cjs'],
        sourcemap: true,
        clean: true,
        outDir: 'dist',
        external: [
            "@wasm-fmt/ruff_fmt",
        ],
    });
}