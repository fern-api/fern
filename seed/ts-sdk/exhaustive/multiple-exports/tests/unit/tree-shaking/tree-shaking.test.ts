import { describe, it, expect } from "vitest";
import webpack from "webpack";
import path from "path";
import fs from "fs";
import os from "os";

function bundle(entryCode: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tree-shake-test-"));
        const entryFile = path.join(tmpDir, "entry.ts");
        fs.writeFileSync(entryFile, entryCode);

        const compiler = webpack({
            mode: "production",
            entry: entryFile,
            output: {
                path: tmpDir,
                filename: "bundle.js",
            },
            resolve: {
                extensions: [".ts", ".js"],
                alias: {
                    "@fern/exhaustive": path.resolve(__dirname, "../../../src"),
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
                                configFile: path.resolve(__dirname, "../../../tsconfig.cjs.json"),
                            },
                        },
                        exclude: /node_modules/,
                    },
                ],
            },
        });

        compiler.run((err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            if (stats?.hasErrors()) {
                reject(new Error(stats.compilation.errors.map((e) => e.message).join("\n")));
                return;
            }

            const bundlePath = path.join(tmpDir, "bundle.js");
            const size = fs.statSync(bundlePath).size;

            // Clean up
            fs.rmSync(tmpDir, { recursive: true, force: true });

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
