/**
 * Invoke the Rust SDK generator against the same IR to produce a
 * `<api>-sdk` library crate that the CLI crate uses as a path
 * dependency.
 *
 * The generated crate contains an HTTP client with the
 * `RequestExecutor` trait — the transport seam that lets the CLI's
 * native executor handle all HTTP while the SDK provides typed
 * request/response helpers. Custom command handlers use
 * `ctx.sdk_client()` to get a fully-wired SDK instance.
 *
 * Single type identity: the SDK crate declares a path dependency on
 * the co-generated `<api>-types` crate and re-exports all types via
 * `pub use <types_crate>::*;`. This means `<api>_sdk::Pet` and
 * `<api>_types::Pet` are the same type — no `From`/`Into` shims.
 *
 * Implementation note: We invoke the rust-sdk generator as a child
 * process (same pattern as `generateEmbeddedTypes`) because the CLI
 * generator and the rust-sdk generator pin different IR SDK versions.
 */

import { execFile } from "child_process";
import { accessSync, constants } from "fs";
import { mkdir, readFile, rm, unlink, writeFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Generate the embedded `<api>-sdk` Rust library crate.
 *
 * @param irFilepath      Path to the IR JSON file on disk.
 * @param outputDir       Absolute path to the CLI generator's output root.
 *                        The SDK crate will be written to `<outputDir>/<sdkCrateName>/`.
 * @param binaryName      Kebab-case CLI binary name (used to derive crate name).
 * @param typesCrateName  Name of the co-generated types crate (e.g. `"my-api-types"`).
 * @returns The generated crate name (e.g. `"my-api-sdk"`).
 */
export async function generateEmbeddedSdk(args: {
    irFilepath: string;
    outputDir: string;
    binaryName: string;
    typesCrateName: string;
}): Promise<string> {
    const { irFilepath, outputDir, binaryName, typesCrateName } = args;
    const sdkCrateName = `${binaryName}-sdk`;
    const sdkOutputDir = path.join(outputDir, sdkCrateName);
    await mkdir(sdkOutputDir, { recursive: true });

    // Write a minimal generator config that the rust-sdk CLI reads.
    // `cliEmbedded: true` tells the SDK generator to skip model/type
    // generation (types come from the co-generated types crate).
    const generatorConfig = {
        irFilepath,
        output: {
            path: sdkOutputDir,
            mode: { type: "downloadFiles" as const }
        },
        customConfig: {
            crateName: sdkCrateName.replace(/-/g, "_"),
            cliEmbedded: true
        },
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

    const cliEntryPoint = resolveRustSdkCli();

    try {
        await execFileAsync("node", ["--enable-source-maps", cliEntryPoint, configPath], {
            cwd: sdkOutputDir,
            timeout: 120_000,
            env: { ...process.env }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Embedded SDK generation failed: ${message}`);
    } finally {
        await unlink(configPath).catch((_e: unknown) => undefined);
    }

    // The rust-sdk generator produces a full crate including Cargo.toml.
    // Patch it to add the types crate as a path dependency and write
    // the prelude re-export for single type identity.
    await patchSdkCrate({ sdkOutputDir, sdkCrateName, typesCrateName });

    return sdkCrateName;
}

/**
 * Patch the SDK crate after the generator runs:
 *   1. Add path dependency on the types crate to Cargo.toml.
 *   2. Write `src/prelude.rs` that re-exports all types.
 *   3. Inject `pub mod prelude;` into `src/lib.rs`.
 *   4. Remove the `.fern/` metadata directory.
 */
async function patchSdkCrate(args: {
    sdkOutputDir: string;
    sdkCrateName: string;
    typesCrateName: string;
}): Promise<void> {
    const { sdkOutputDir, sdkCrateName, typesCrateName } = args;
    const typesSnakeName = typesCrateName.replace(/-/g, "_");
    const sdkSnakeName = sdkCrateName.replace(/-/g, "_");

    // 1. Patch Cargo.toml — add types crate as a path dependency.
    const cargoTomlPath = path.join(sdkOutputDir, "Cargo.toml");
    let cargoToml: string;
    try {
        cargoToml = await readFile(cargoTomlPath, "utf-8");
    } catch (_e: unknown) {
        // If the SDK generator didn't produce a Cargo.toml, write a
        // minimal one (same fallback pattern as generateEmbeddedTypes).
        cargoToml = [
            "[package]",
            `name = "${sdkSnakeName}"`,
            'version = "0.0.0"',
            'edition = "2021"',
            "",
            "[lib]",
            "doctest = false",
            ""
        ].join("\n");
    }

    // Insert path dependency on types crate before [profile] or at end.
    const typesDep = `\n[dependencies.${typesSnakeName}]\npath = "../${typesCrateName}"\n`;
    const profileIdx = cargoToml.indexOf("\n[profile.");
    if (profileIdx !== -1) {
        cargoToml = cargoToml.slice(0, profileIdx) + typesDep + cargoToml.slice(profileIdx);
    } else {
        cargoToml = cargoToml.trimEnd() + "\n" + typesDep;
    }
    await writeFile(cargoTomlPath, cargoToml);

    // 2. Write src/prelude.rs — re-exports the types crate for single
    //    type identity (`<sdk>::Pet` == `<types>::Pet`).
    const srcDir = path.join(sdkOutputDir, "src");
    await mkdir(srcDir, { recursive: true });
    const preludeContent = `pub use ${typesSnakeName}::*;\n`;
    await writeFile(path.join(srcDir, "prelude.rs"), preludeContent);

    // 2b. Patch src/api/mod.rs — re-export the types crate so that
    //     service resource files (`use crate::api::*;`) can resolve
    //     request/response types from the co-generated types crate.
    const apiModPath = path.join(srcDir, "api", "mod.rs");
    try {
        const apiModContent = await readFile(apiModPath, "utf-8");
        const typesReExport = `pub use ${typesSnakeName}::*;`;
        if (!apiModContent.includes(typesReExport)) {
            await writeFile(apiModPath, apiModContent.trimEnd() + `\n\n${typesReExport}\n`);
        }
    } catch (_e: unknown) {
        // api/mod.rs doesn't exist — nothing to patch.
    }

    // 3. Inject `pub mod prelude;` into lib.rs if not already present.
    const libPath = path.join(srcDir, "lib.rs");
    try {
        const libContent = await readFile(libPath, "utf-8");
        if (!libContent.includes("pub mod prelude;")) {
            // Insert after the header comment / first blank line.
            const insertIdx = libContent.indexOf("\n\n");
            if (insertIdx !== -1) {
                const patched =
                    libContent.slice(0, insertIdx + 2) + "pub mod prelude;\n" + libContent.slice(insertIdx + 2);
                await writeFile(libPath, patched);
            } else {
                await writeFile(libPath, libContent + "\npub mod prelude;\n");
            }
        }
    } catch (_e: unknown) {
        // lib.rs doesn't exist — write a minimal one.
        await writeFile(libPath, `//! Generated SDK by Fern\n\npub mod prelude;\n`);
    }

    // 4. Remove the .fern/ metadata directory written by the base
    //    generator framework — not needed inside a workspace member.
    await rm(path.join(sdkOutputDir, ".fern"), { recursive: true, force: true });
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
function resolveRustSdkCli(): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");

    // 1. Docker / dist:cli build — bundled in dist/rust-sdk-dist/
    const bundled = path.resolve(scriptDir, "rust-sdk-dist", "cli.cjs");
    try {
        accessSync(bundled, constants.R_OK);
        return bundled;
    } catch (_e: unknown) {
        // Not found — fall through to monorepo resolution.
    }

    // 2. Monorepo dev — resolve via pnpm workspace link.
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const base = import.meta.url || (typeof __filename !== "undefined" ? `file://${__filename}` : "file:///");
        const require = createRequire(base);
        const sdkPkg = require.resolve("@fern-api/rust-sdk/package.json");
        const sdkRoot = path.dirname(sdkPkg);
        const devEntry = path.join(sdkRoot, "lib", "cli.js");
        accessSync(devEntry, constants.R_OK);
        return devEntry;
    } catch (_e: unknown) {
        // fall through
    }

    throw new Error(
        "Could not resolve the @fern-api/rust-sdk CLI. " +
            "Ensure `pnpm turbo run dist:cli --filter @fern-api/rust-sdk` has been run, " +
            "or that @fern-api/rust-sdk is installed in the workspace."
    );
}
