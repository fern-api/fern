import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { build as tsup } from "tsdown";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf-8"));

main();

async function main() {
    const config = {
        entry: ['src/**/*.ts', '!src/__test__'],
        target: "es2017",
        minify: true,
        dts: true,
        sourcemap: true,
        esbuildPlugins: [
            NodeModulesPolyfillPlugin(),
            NodeGlobalsPolyfillPlugin({
                process: true,
                buffer: true,
                util: true
            })
        ],
        tsconfig: "./build.tsconfig.json"
    };

    await tsup({
        ...config,
        format: ['cjs'],
        outDir: 'dist/cjs',
        clean: true,
    });

    await tsup({
        ...config,
        format: ['esm'],
        outDir: 'dist/esm',
        clean: false,
    });

    await mkdir(join(__dirname, "dist"), { recursive: true });
    process.chdir(join(__dirname, "dist"));

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                type: "module",
                exports: {
                    // Conditional exports for ESM and CJS.
                    "import": {
                        "types": "./esm/index.d.ts",
                        "default": "./esm/index.js"
                    },
                    "require": {
                        "types": "./cjs/index.d.cts",
                        "default": "./cjs/index.cjs"
                    }
                },
                // Fallback for older tooling or direct imports.
                main: "./cjs/index.cjs",
                module: "./esm/index.js",
                types: "./cjs/index.d.cts",
                files: [
                    "cjs",
                    "esm"
                ]
            },
            undefined,
            2
        )
    );
}