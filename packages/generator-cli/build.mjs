import { exec } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
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
        tsconfig: "tsconfig.build.json",
        dts: { compilerOptions: { composite: false } },
        minify: false,
        sourcemap: false,
        outDir: path.join(outDirAbs, "dist"),
        clean: true
    };

    // CLI: bundle everything so it works as a standalone binary.
    // Keep @boundaryml/baml external so esbuild does not try to bundle its
    // platform-specific native .node files; at runtime it's resolved from
    // node_modules via the baml dep listed in the published package.json below.
    await tsup.build({
        ...commonConfig,
        entry: ["src/cli.ts"],
        // Match everything EXCEPT @boundaryml/baml so esbuild does not try to
        // statically bundle baml's platform-specific native .node files; baml
        // is resolved from node_modules at runtime via the dep in package.json.
        noExternal: [/^(?!@boundaryml\/baml(\/|$)).*/],
        external: ["@boundaryml/baml"]
    });

    // API: bundle private workspace deps so consumers of the published
    // package don't need them on disk (they aren't listed as npm deps), keep
    // published deps external so npm manages them for consumers. Keep
    // @boundaryml/baml external so esbuild does not bundle its platform-
    // specific native .node files; baml is a direct dep of generator-cli
    // below and resolved from node_modules at runtime.
    await tsup.build({
        ...commonConfig,
        entry: ["src/api.ts"],
        noExternal: [
            "@fern-api/github",
            "@fern-api/fs-utils",
            "@fern-api/core-utils",
            "@fern-api/logging-execa",
            "@fern-api/task-context",
            "@fern-api/cli-ai"
        ],
        external: ["@fern-api/replay", "@octokit/rest", "es-toolkit", "tmp-promise", "@boundaryml/baml"],
        clean: false
    });

    // Write dist/bin/cli with the path that works from within the published dist/ directory.
    // (The local bin/cli uses ../lib/cli.js for workspace use; the published dist/bin/cli uses
    // ../dist/cli.js because dist/dist/cli.js sits one level up from dist/bin/.)
    await mkdir(path.join(outDirAbs, "bin"), { recursive: true });
    await writeFile(path.join(outDirAbs, "bin", "cli"), '#!/usr/bin/env node\nrequire("../dist/cli.js");\n', {
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
                        types: "./dist/api.d.ts",
                        default: "./dist/api.js"
                    }
                },
                main: "dist/api.js",
                types: "dist/api.d.ts",
                bin: {
                    "generator-cli": "bin/cli"
                },
                files: ["**"],
                dependencies: Object.fromEntries(
                    Object.entries(packageJson.dependencies).filter(([, v]) => !String(v).startsWith("workspace:"))
                ),
                license: packageJson.license
            },
            undefined,
            2
        )
    );

    await execAsync("npm pkg fix", { cwd: outDirAbs });
}
