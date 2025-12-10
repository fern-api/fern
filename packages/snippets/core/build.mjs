import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import packageJson from "./package.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

main();

async function main() {
    // Change to the package directory to ensure relative paths work
    process.chdir(__dirname);

    // Remove dist directory entirely
    await rm(path.join(__dirname, "dist"), { recursive: true, force: true });

    const config = {
        entry: ["src/**/*.ts", "!src/__test__"],
        target: "es2020",
        minify: true,
        dts: true,
        sourcemap: true,
        esbuildPlugins: [
            polyfillNode({
                // Inject globals for backwards compatibility
                globals: {
                    buffer: true,
                    process: true
                },
                // Disable fs and crypto polyfills (use native/external instead)
                // All other Node.js built-ins (including util) are polyfilled by default
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
        format: ["cjs"],
        outDir: "dist/cjs",
        clean: false
    });

    await tsup.build({
        ...config,
        format: ["esm"],
        outDir: "dist/esm",
        clean: false
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
                    // Conditional exports for ESM and CJS.
                    import: {
                        types: "./esm/index.d.ts",
                        default: "./esm/index.js"
                    },
                    require: {
                        types: "./cjs/index.d.cts",
                        default: "./cjs/index.cjs"
                    }
                },
                // Fallback for older tooling or direct imports.
                main: "./cjs/index.cjs",
                module: "./esm/index.js",
                types: "./cjs/index.d.cts",
                files: ["cjs", "esm"]
            },
            undefined,
            2
        )
    );
}
