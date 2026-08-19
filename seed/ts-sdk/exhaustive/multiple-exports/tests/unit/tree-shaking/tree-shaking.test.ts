import { describe, it, expect } from "vitest";
import webpack from "webpack";
import path from "path";
import fs from "fs";

const PKG_ROOT = path.resolve(__dirname, "../../..");

function bundle(entryCode: string): Promise<number> {
    return new Promise((resolve, reject) => {
        // Create the temporary entry inside the package's `src` directory so that it
        // falls under the `rootDir`/`include` of the SDK's tsconfig (which ts-loader
        // uses). Writing it to the OS temp dir trips TS6059 ("not under rootDir").
        const tmpDir = fs.mkdtempSync(path.join(PKG_ROOT, "src", "tree-shake-test-"));
        const entryFile = path.join(tmpDir, "entry.ts");
        fs.writeFileSync(entryFile, entryCode);

        // The temp dir lives under `src/`, which is included by the SDK's tsconfig.
        // Always remove it (success or failure) so an orphaned entry can't pollute
        // subsequent TypeScript compilations or get accidentally committed.
        const cleanup = () => fs.rmSync(tmpDir, { recursive: true, force: true });

        const compiler = webpack({
            mode: "production",
            entry: entryFile,
            output: {
                path: tmpDir,
                filename: "bundle.js",
            },
            resolve: {
                extensions: [".ts", ".js"],
                // The generated source uses ".js" extensions in its imports
                // (ESM-style), but the actual files on disk are ".ts".
                // extensionAlias tells webpack to try ".ts" when it sees ".js".
                extensionAlias: {
                    ".js": [".ts", ".js"],
                },
                // Use exact-match aliases ($) so that the root alias does not
                // swallow subpackage imports.  Subpackage paths point straight at
                // the source exports file that the generator creates.
                alias: {
                    "@fern/exhaustive/noAuth$": path.join(PKG_ROOT, "src/api/resources/noAuth/exports.ts"),
                    "@fern/exhaustive$": path.join(PKG_ROOT, "src/index.ts"),
                },
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true,
                                configFile: path.join(PKG_ROOT, "tsconfig.cjs.json"),
                                compilerOptions: {
                                    // Disable isolatedDeclarations which requires
                                    // declaration output; not needed for bundling.
                                    isolatedDeclarations: false,
                                    declaration: false,
                                },
                            },
                        },
                        exclude: /node_modules/,
                    },
                ],
            },
        });

        compiler.run((err, stats) => {
            if (err) {
                cleanup();
                reject(err);
                return;
            }
            if (stats?.hasErrors()) {
                const error = new Error(stats.compilation.errors.map((e) => e.message).join("\n"));
                cleanup();
                reject(error);
                return;
            }

            const bundlePath = path.join(tmpDir, "bundle.js");
            const size = fs.statSync(bundlePath).size;

            cleanup();

            resolve(size);
        });
    });
}

describe("Tree Shaking", () => {
    it("subpackage import produces a smaller bundle than full SDK import", async () => {
        const fullBundleCode = `
            import { SeedExhaustiveClient } from "@fern/exhaustive";
            console.log(SeedExhaustiveClient);
        `;

        const subpackageBundleCode = `
            import { NoAuthClient } from "@fern/exhaustive/noAuth";
            console.log(NoAuthClient);
        `;

        const [fullSize, subpackageSize] = await Promise.all([
            bundle(fullBundleCode),
            bundle(subpackageBundleCode),
        ]);

        // The subpackage bundle should be meaningfully smaller than the full SDK bundle.
        // We use a 30% threshold to avoid flakiness while still catching regressions.
        const ratio = subpackageSize / fullSize;
        console.log(`Full SDK bundle: ${fullSize} bytes`);
        console.log(`Subpackage bundle: ${subpackageSize} bytes`);
        console.log(`Ratio: ${(ratio * 100).toFixed(1)}%`);

        expect(ratio).toBeLessThan(0.7);
    }, 60_000);
});
