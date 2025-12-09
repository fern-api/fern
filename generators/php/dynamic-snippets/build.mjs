import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import packageJson from "./package.json" with { type: "json" };
import tsup from 'tsup';
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

main();

async function main() {
    process.chdir(__dirname);

    await rm(path.join(__dirname, "dist"), { recursive: true, force: true });

    const config = {
        entry: ['src/**/*.ts', '!src/__test__'],
        target: "es2020",
        minify: true,
        dts: true,
        sourcemap: true,
        esbuildPlugins: [
            polyfillNode({
                globals: {
                    buffer: true,
                    process: true
                },
                polyfills: {
                    fs: false,
                    crypto: false
                }
            })
        ],
        tsconfig: "./build.tsconfig.json"
    };

    await tsup.build({
        ...config,
        format: ['cjs'],
        outDir: 'dist/cjs',
        clean: false,
    });

    await tsup.build({
        ...config,
        format: ['esm'],
        outDir: 'dist/esm',
        clean: false,
    });

    await mkdir(path.join(__dirname, "dist"), { recursive: true });
    process.chdir(path.join(__dirname, "dist"));

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                type: "module",
                exports: {
                    "import": {
                        "types": "./esm/index.d.ts",
                        "default": "./esm/index.js"
                    },
                    "require": {
                        "types": "./cjs/index.d.cts",
                        "default": "./cjs/index.cjs"
                    }
                },
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
