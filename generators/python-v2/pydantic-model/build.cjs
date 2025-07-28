const tsdown = require('tsdown');

main();

async function main() {
    await tsdown.build({
        entry: ['src/**/*.ts', '!src/__test__'],
        format: ['cjs'],
        clean: true,
        outDir: 'dist',
        external: [
            "@wasm-fmt/ruff_fmt",
        ],
    });
}