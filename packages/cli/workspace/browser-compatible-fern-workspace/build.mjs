import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import packageJson from "./package.json" with { type: "json" };

/**
 * Resolves catalog versions from pnpm-workspace.yaml.
 */
async function resolveCatalogVersion(packageName) {
    try {
        const workspaceYaml = await readFile(path.join(__dirname, "../../../../pnpm-workspace.yaml"), "utf-8");
        const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = workspaceYaml.match(new RegExp(`"${escapedName}":\\s*(.+)`));
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
    const externalDeps = ["@open-rpc/meta-schema", "openapi-types"];

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
        external: externalDeps,
        esbuildPlugins: [
            // Polyfill Node.js built-ins (util, path, assert) so transitive deps
            // like object-inspect (qs → side-channel → object-inspect) don't break
            // in Turbopack/browser environments with `require('util')`.
            // Disable fs/crypto polyfills so workspace deps that use them keep
            // the native Node.js externals intact.
            polyfillNode({
                globals: false,
                polyfills: {
                    fs: false,
                    crypto: false
                }
            })
        ]
    });

    const version = process.argv[2] || process.env.PACKAGE_VERSION || "0.0.1";
    const openRpcMetaSchemaVersion = await resolveCatalogVersion("@open-rpc/meta-schema");

    await writeFile(
        path.join(outDirAbs, "package.json"),
        JSON.stringify(
            {
                name: "@fern-api/browser-compatible-fern-workspace",
                version,
                description:
                    "Browser-compatible API spec to FDR API Definition converter. Converts parsed OpenAPI 3.1, AsyncAPI, and OpenRPC specs to Fern IR and FDR API Definitions without filesystem access.",
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
                    "@open-rpc/meta-schema": openRpcMetaSchemaVersion,
                    "openapi-types": packageJson.dependencies["openapi-types"]
                },
                license: "MIT"
            },
            undefined,
            2
        )
    );
}
