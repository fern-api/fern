/**
 * Invoke the Rust SDK generator in-process to produce a `<api>-sdk`
 * library crate that the CLI crate uses as a path dependency.
 *
 * The generated crate contains an HTTP client with the
 * `RequestExecutor` trait — the transport seam that lets the CLI's
 * native executor handle all HTTP while the SDK provides typed
 * request/response helpers. Custom command handlers use
 * `super::sdk::client(ctx)` to get a fully-wired SDK instance.
 *
 * Single type identity: the SDK crate declares a path dependency on
 * the co-generated `<api>-types` crate and re-exports all types via
 * `pub use <types_crate>::*;`. This means `<api>_sdk::Pet` and
 * `<api>_types::Pet` are the same type — no `From`/`Into` shims.
 *
 * Implementation: The CLI generator down-migrates the IR from v67 to
 * v66 (the Rust SDK's pinned version) using
 * `migrateIntermediateRepresentationForGenerator`, then invokes the
 * Rust SDK generator in-process. JSON serialization bridges the two
 * IR SDK versions — no shared in-memory types or version-lockstep
 * requirement. The returned `SdkGeneratorContext` provides
 * authoritative de-conflicted client names for `sdk.rs` generation.
 */

import { migrateIntermediateRepresentationForGenerator } from "@fern-api/ir-migrations";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { SdkGeneratorCli, SdkGeneratorContext } from "@fern-api/rust-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, readFile, rm, unlink, writeFile } from "fs/promises";
import path from "path";

/** Name used for IR migration target resolution. */
const RUST_SDK_GENERATOR_NAME = "fernapi/fern-rust-sdk";
/** Version used for IR migration target resolution. */
const RUST_SDK_GENERATOR_VERSION = "0.0.0";

export interface EmbeddedSdkResult {
    sdkCrateName: string;
    sdkContext: SdkGeneratorContext;
}

/**
 * Generate the embedded `<api>-sdk` Rust library crate.
 *
 * @param irFilepath      Path to the IR JSON file on disk (v67).
 * @param outputDir       Absolute path to the CLI generator's output root.
 *                        The SDK crate will be written to `<outputDir>/<sdkCrateName>/`.
 * @param binaryName      Kebab-case CLI binary name (used to derive crate name).
 * @param typesCrateName  Name of the co-generated types crate (e.g. `"my-api-types"`).
 * @returns The generated crate name and the Rust SDK generator context
 *          (used to read authoritative de-conflicted client names).
 */
export async function generateEmbeddedSdk(args: {
    irFilepath: string;
    outputDir: string;
    binaryName: string;
    typesCrateName: string;
}): Promise<EmbeddedSdkResult> {
    const { irFilepath, outputDir, binaryName, typesCrateName } = args;
    const sdkCrateName = `${binaryName}-sdk`;
    const sdkOutputDir = path.join(outputDir, sdkCrateName);
    await mkdir(sdkOutputDir, { recursive: true });

    // 1. Read and parse the IR at v67 using the workspace IR SDK.
    const irContent = await readFile(irFilepath, "utf-8");
    const irJson = JSON.parse(irContent);
    const parsedIr = IrSerialization.IntermediateRepresentation.parse(irJson, {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedEnumValues: true,
        allowUnrecognizedUnionMembers: true
    });
    if (!parsedIr.ok) {
        throw new Error(`Failed to parse IR v67: ${JSON.stringify(parsedIr.errors, null, 2)}`);
    }

    // 2. Down-migrate IR v67 → v66 for the Rust SDK generator.
    //    This closes a latent correctness gap: previously, the subprocess
    //    received IR v67 directly with no migration (relying on lenient
    //    unknown-key stripping). The explicit migration ensures the Rust
    //    generator receives IR at its pinned version.
    const taskContext = createMockTaskContext();
    const migratedIrJson = await migrateIntermediateRepresentationForGenerator({
        intermediateRepresentation: parsedIr.value,
        context: taskContext,
        targetGenerator: {
            name: RUST_SDK_GENERATOR_NAME,
            version: RUST_SDK_GENERATOR_VERSION
        }
    });

    // 3. Write migrated IR to a temp file for the in-process generator.
    const migratedIrPath = path.join(sdkOutputDir, ".migrated-ir.json");
    await writeFile(migratedIrPath, JSON.stringify(migratedIrJson));

    // 4. Write generator config for in-process invocation.
    const generatorConfig = {
        irFilepath: migratedIrPath,
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

    // 5. Invoke the Rust SDK generator in-process and capture context.
    //    Set FERN_RUST_ASIS_DIR so the rust-sdk's AsIs resolver finds templates
    //    at the bundled `rust-sdk-dist/asIs/` path without relying solely on
    //    __dirname fallback heuristics.
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");
    const previousAsIsDir = process.env.FERN_RUST_ASIS_DIR;
    process.env.FERN_RUST_ASIS_DIR = path.resolve(scriptDir, "rust-sdk-dist", "asIs");

    let sdkContext: SdkGeneratorContext;
    try {
        const cli = new SdkGeneratorCli();
        sdkContext = await cli.generateAndReturnContext(configPath);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Embedded SDK generation failed: ${message}`);
    } finally {
        // Restore env to avoid leaking state.
        if (previousAsIsDir != null) {
            process.env.FERN_RUST_ASIS_DIR = previousAsIsDir;
        } else {
            delete process.env.FERN_RUST_ASIS_DIR;
        }
        await unlink(configPath).catch((_e: unknown) => undefined);
        await unlink(migratedIrPath).catch((_e: unknown) => undefined);
    }

    // 6. Patch the SDK crate (types dependency, prelude, .fern cleanup).
    await patchSdkCrate({ sdkOutputDir, sdkCrateName, typesCrateName });

    return { sdkCrateName, sdkContext };
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
