import { exec } from "child_process";
import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

await main();

async function main() {
    const outDirAbs = path.join(__dirname, "dist");
    await rm(outDirAbs, { recursive: true, force: true });

    await tsup.build({
        format: ["cjs"],
        tsconfig: "tsconfig.build.json",
        dts: { compilerOptions: { composite: false } },
        minify: false,
        sourcemap: false,
        outDir: path.join(outDirAbs, "dist"),
        clean: true,
        entry: ["src/cli.ts"],
        noExternal: [/.*/]
    });

    await mkdir(path.join(outDirAbs, "bin"), { recursive: true });
    await writeFile(path.join(outDirAbs, "bin", "cli"), '#!/usr/bin/env node\nrequire("../dist/cli.js");\n', {
        mode: 0o755
    });

    await writeFile(
        path.join(outDirAbs, "package.json"),
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                description: packageJson.description,
                repository: packageJson.repository,
                type: packageJson.type,
                main: "dist/cli.js",
                types: "dist/cli.d.ts",
                bin: {
                    "fern-wizard": "bin/cli"
                },
                files: ["**"],
                dependencies: Object.fromEntries(
                    Object.entries(packageJson.dependencies).filter(
                        ([, value]) => !String(value).startsWith("workspace:")
                    )
                ),
                license: packageJson.license
            },
            undefined,
            2
        )
    );

    await execAsync("npm pkg fix", { cwd: outDirAbs });
}
