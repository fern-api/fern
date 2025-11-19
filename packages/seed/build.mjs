import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build as tsup } from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf-8"));

main();

async function main() {
    await tsup({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        minify: false,
        outDir: 'dist',
        sourcemap: true,
        env: {
            CLI_NAME: "seed",
            CLI_PACKAGE_NAME: "seed-cli",
            CLI_VERSION: process.argv[2] || packageJson.version,
        },
        external: [
            '@fern-api/go-formatter',
          ],
    });     
}