import { exec } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import { build } from "tsdown";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

main();

async function main() {
    const outDirAbs = path.join(__dirname, "dist");
    await rm(outDirAbs, { recursive: true, force: true });

    const commonConfig = {
        format: ["cjs"],
        dts: true,
        inlineOnly: false,
        minify: false,
        sourcemap: false,
        outDir: path.join(outDirAbs, "dist"),
        clean: true
    };

    await build({
        ...commonConfig,
        entry: ["src/cli.ts"],
        noExternal: [/.*/]
    });

    await build({
        ...commonConfig,
        entry: ["src/api.ts"],
        noExternal: ["@fern-api/github", "@fern-api/fs-utils"],
        external: ["@fern-api/replay", "@octokit/rest", "es-toolkit", "tmp-promise"],
        clean: false
    });

    await mkdir(path.join(outDirAbs, "bin"), { recursive: true });
    await writeFile(path.join(outDirAbs, "bin", "cli"), '#!/usr/bin/env node\nrequire("../dist/cli.cjs");\n', {
        mode: 0o755
    });

    await writeFile(
        path.join(outDirAbs, "package.json"),
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || process.env.GENERATOR_CLI_VERSION || packageJson.version,
                description: packageJson.description,
                repository: packageJson.repository,
                type: packageJson.type,
                exports: {
                    ".": {
                        types: "./dist/api.d.cts",
                        default: "./dist/api.cjs"
                    }
                },
                main: "dist/api.cjs",
                types: "dist/api.d.cts",
                bin: {
                    "generator-cli": "bin/cli"
                },
                files: ["**"],
                dependencies: packageJson.dependencies,
                license: packageJson.license
            },
            undefined,
            2
        )
    );

    await execAsync("npm pkg fix", { cwd: outDirAbs });
}
