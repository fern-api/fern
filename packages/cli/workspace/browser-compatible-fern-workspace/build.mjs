import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import packageJson from "./package.json" with { type: "json" };

/**
 * Resolves the actual version of @fern-api/fdr-sdk from the pnpm catalog.
 * Reads the root pnpm-workspace.yaml to find the catalog version.
 */
async function resolveFdrSdkVersion() {
    try {
        const workspaceYaml = await readFile(path.join(__dirname, "../../../../pnpm-workspace.yaml"), "utf-8");
        const match = workspaceYaml.match(/"@fern-api\/fdr-sdk":\s*(.+)/);
        if (match) {
            return match[1].trim();
        }
    } catch {
        // fallback
    }
    return "*";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

main();

async function main() {
    const outDirAbs = path.join(__dirname, "dist");
    await rm(outDirAbs, { recursive: true, force: true });

    // Bundle all workspace:* deps (internal to fern monorepo) into the output.
    // Keep npm-published deps external so consumers manage them via package.json.
    const externalDeps = ["@fern-api/fdr-sdk", "openapi-types"];

    await tsup.build({
        entry: ["src/index.ts"],
        format: ["esm"],
        tsconfig: "tsconfig.json",
        dts: { compilerOptions: { composite: false } },
        minify: false,
        sourcemap: false,
        outDir: path.join(outDirAbs, "dist"),
        clean: true,
        // Bundle everything except external deps
        noExternal: [/.*/],
        external: externalDeps
    });

    const version = process.argv[2] || process.env.PACKAGE_VERSION || "0.0.1";
    const fdrSdkVersion = await resolveFdrSdkVersion();

    await writeFile(
        path.join(outDirAbs, "package.json"),
        JSON.stringify(
            {
                name: "@fern-api/browser-compatible-fern-workspace",
                version,
                description:
                    "Browser-compatible OpenAPI to FDR API Definition converter. Converts parsed OpenAPI 3.1 specs to Fern IR and FDR API Definitions without filesystem access.",
                repository: packageJson.repository,
                type: "module",
                exports: {
                    ".": {
                        types: "./dist/index.d.ts",
                        import: "./dist/index.js",
                        default: "./dist/index.js"
                    }
                },
                main: "dist/index.js",
                types: "dist/index.d.ts",
                files: ["**"],
                dependencies: {
                    "@fern-api/fdr-sdk": fdrSdkVersion,
                    "openapi-types": packageJson.dependencies["openapi-types"]
                },
                peerDependencies: {
                    "@fern-api/fdr-sdk": ">=0.100.0"
                },
                peerDependenciesMeta: {
                    "@fern-api/fdr-sdk": {
                        optional: true
                    }
                },
                license: "MIT"
            },
            undefined,
            2
        )
    );
}
