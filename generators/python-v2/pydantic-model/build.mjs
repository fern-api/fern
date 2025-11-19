import { fileURLToPath } from "url";
import tsup from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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