import packageJson from "./package.json" with { type: "json" };
import tsup from 'tsup';
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

main();

async function main() {
    await tsup.build({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        minify: false,
        outDir: 'dist',
        sourcemap: true,
        clean: true,
        esbuildOptions(options) {
            options.conditions = ['development', 'source', 'import', 'default']
        },
        env: {
            CLI_NAME: "seed",
            CLI_PACKAGE_NAME: "seed-cli",
            CLI_VERSION: process.argv[2] || packageJson.version,
        },
        external: [
            '@fern-api/go-formatter',
            '@boundaryml/baml',
        ],
    });

    process.chdir(path.join(__dirname, "dist"));

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "fern-api",
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                files: ["cli.cjs"],
                bin: { fern: "cli.cjs" },
                dependencies: {
                    "@boundaryml/baml": packageJson.dependencies["@boundaryml/baml"]
                }
            },
            undefined,
            2
        )
    );
}
