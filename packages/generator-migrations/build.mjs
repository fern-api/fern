import { exec } from "child_process";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { build } from "tsdown";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

async function buildPackage(config = {}) {
    const { version = packageJson.version } = config;
    const distDir = path.join(__dirname, "dist");
    await rm(distDir, { recursive: true, force: true });
    await build({
        entry: ["src/index.ts"],
        format: ["esm"],
        outDir: "dist/dist",
        target: "node18",
        dts: {
            resolve: true // Bundle ALL external type dependencies
        },
        sourcemap: true,
        clean: true,
        // Bundle all dependencies (including workspace dependencies) into the output
        noExternal: [/.*/]
    });

    const outputPackageJson = {
        name: packageJson.name,
        version,
        description: packageJson.description,
        repository: packageJson.repository,
        sideEffects: packageJson.sideEffects,
        type: packageJson.type,
        main: "dist/index.mjs",
        types: "dist/index.d.mts",
        files: ["dist"],
        keywords: packageJson.keywords,
        license: packageJson.license
    };

    const packageJsonPath = path.join(distDir, "package.json");
    await writeFile(packageJsonPath, JSON.stringify(outputPackageJson, null, 2));
    await execAsync("npm pkg fix", { cwd: distDir });
}

// Get version from command line args (e.g., node build.mjs 0.1.0)
const version = process.argv[2];

await buildPackage({ version });
