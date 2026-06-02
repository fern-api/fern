/**
 * Invoke the Rust SDK generator against the same IR to produce a typed
 * `<api>-sdk` library crate that the CLI crate uses as a path dependency.
 *
 * The generated crate is a **library only** — no binaries, no wire
 * tests, no README. The CLI crate re-exports the SDK's types through
 * `custom.rs` so end-users author `async fn` handlers that call
 * strongly-typed SDK methods.
 *
 * Implementation note: We invoke the rust-sdk generator as a child
 * process rather than linking it in-process because the CLI generator
 * and the rust-sdk generator pin different IR SDK versions (67 vs 66).
 * A child process avoids type incompatibilities while still running
 * against the same IR JSON file.
 */

import { execFile } from "child_process";
import { accessSync, constants } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Generate the embedded `<api>-sdk` Rust library crate.
 *
 * @param irFilepath Path to the IR JSON file on disk.
 * @param outputDir  Absolute path to the CLI generator's output root.
 *                   The SDK crate will be written to `<outputDir>/<sdkCrateName>/`.
 * @param binaryName Kebab-case CLI binary name (used to derive crate name).
 * @returns The generated crate name (e.g. `"my-api-sdk"`).
 */
export async function generateEmbeddedSdk(args: {
    irFilepath: string;
    outputDir: string;
    binaryName: string;
}): Promise<string> {
    const { irFilepath, outputDir, binaryName } = args;
    const sdkCrateName = `${binaryName}-sdk`;
    const sdkOutputDir = path.join(outputDir, sdkCrateName);
    await mkdir(sdkOutputDir, { recursive: true });

    // Write a minimal generator config that the rust-sdk CLI reads.
    // crateName must match the dependency key that patchCargoToml writes
    // (snake_case of sdkCrateName), otherwise Cargo cannot resolve the
    // path dependency by package name.
    const generatorConfig = {
        irFilepath,
        output: {
            path: sdkOutputDir,
            mode: { type: "downloadFiles" as const }
        },
        customConfig: { crateName: sdkCrateName.replace(/-/g, "_") },
        workspaceName: binaryName,
        organization: "",
        environment: { _type: "local" as const, type: "local" as const },
        dryRun: false,
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false,
        generatePaginatedClients: false
    };

    const configPath = path.join(sdkOutputDir, ".generator-config.json");
    await writeFile(configPath, JSON.stringify(generatorConfig, null, 2));

    const { entryPoint: cliEntryPoint, assetsDir } = resolveRustSdkCli();

    // Point the subprocess at the features.yml bundled in the rust-sdk dist directory.
    const featuresYml = path.join(assetsDir, "features.yml");

    try {
        await execFileAsync("node", ["--enable-source-maps", cliEntryPoint, configPath], {
            cwd: sdkOutputDir,
            timeout: 120_000,
            env: { ...process.env, FERN_FEATURES_YML_PATH: featuresYml }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Embedded SDK generation failed: ${message}`);
    } finally {
        // Best-effort cleanup; file may already be absent if the subprocess moved it.
        await unlink(configPath).catch((_e: unknown) => undefined);
    }

    return sdkCrateName;
}

/**
 * Resolve the rust-sdk generator's CLI entry point.
 *
 * Resolution order:
 *   1. Bundled `rust-sdk-cli.cjs` next to the CLI generator's own
 *      bundled entry (Docker image, after `build.mjs` copies it).
 *   2. Monorepo workspace — `@fern-api/rust-sdk` package's compiled
 *      `lib/cli.js` (development, after `pnpm compile`).
 */
function resolveRustSdkCli(): { entryPoint: string; assetsDir: string } {
    // Resolve the directory containing this script. In the CJS bundle
    // `import.meta` is empty so we fall back to Node's native `__dirname`.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");

    // 1. Docker / dist:cli build — bundled in dist/rust-sdk-dist/
    const bundled = path.resolve(scriptDir, "rust-sdk-dist", "cli.cjs");
    try {
        accessSync(bundled, constants.R_OK);
        return { entryPoint: bundled, assetsDir: path.resolve(path.dirname(bundled), "assets") };
    } catch (_e: unknown) {
        // Not found — fall through to monorepo resolution.
    }

    // 2. Monorepo dev — resolve via pnpm workspace link.
    try {
        // In CJS import.meta.url is empty; use __filename for createRequire.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const resolveFrom = import.meta.url ?? (typeof __filename !== "undefined" ? `file://${__filename}` : undefined);
        if (resolveFrom != null) {
            const esmRequire = createRequire(resolveFrom);
            const pkgDir = path.dirname(esmRequire.resolve("@fern-api/rust-sdk/package.json"));
            return {
                entryPoint: path.join(pkgDir, "lib", "cli.js"),
                assetsDir: path.join(pkgDir, "dist", "assets")
            };
        }
    } catch (_e: unknown) {
        // Package not resolvable — will throw below with actionable message.
    }

    throw new Error(
        "Could not resolve @fern-api/rust-sdk CLI. " +
            "Ensure the rust-sdk package is compiled (pnpm turbo run compile --filter @fern-api/rust-sdk) " +
            "or dist:cli has been run."
    );
}
