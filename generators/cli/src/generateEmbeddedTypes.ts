/**
 * Invoke the Rust model generator against the same IR to produce a
 * `<api>-types` library crate that the CLI crate uses as a path
 * dependency.
 *
 * The generated crate contains **types only** — serde-derive structs
 * and enums for every request/response shape in the API. No HTTP
 * client, no runtime dependencies beyond `serde` / `serde_json`.
 * Custom command handlers use these types with `ctx.invoke()` for
 * typed serialization / deserialization while all HTTP execution stays
 * on the native CLI executor.
 *
 * Implementation note: We invoke the rust-model generator as a child
 * process rather than linking it in-process because the CLI generator
 * and the rust-model generator pin different IR SDK versions (67 vs
 * 66). A child process avoids type incompatibilities while still
 * running against the same IR JSON file.
 */

import { execFile } from "child_process";
import { accessSync, constants } from "fs";
import { cp, mkdir, readdir, readFile, rename, rm, unlink, writeFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Generate the embedded `<api>-types` Rust library crate (types only).
 *
 * @param irFilepath Path to the IR JSON file on disk.
 * @param outputDir  Absolute path to the CLI generator's output root.
 *                   The types crate will be written to `<outputDir>/<typesCrateName>/`.
 * @param binaryName Kebab-case CLI binary name (used to derive crate name).
 * @returns The generated crate name (e.g. `"my-api-types"`).
 */
export async function generateEmbeddedTypes(args: {
    irFilepath: string;
    outputDir: string;
    binaryName: string;
}): Promise<string> {
    const { irFilepath, outputDir, binaryName } = args;
    const typesCrateName = `${binaryName}-types`;
    const typesOutputDir = path.join(outputDir, typesCrateName);
    await mkdir(typesOutputDir, { recursive: true });

    // Write a minimal generator config that the rust-model CLI reads.
    // crateName must match the dependency key that patchCargoToml writes
    // (snake_case of typesCrateName), otherwise Cargo cannot resolve the
    // path dependency by package name.
    const generatorConfig = {
        irFilepath,
        output: {
            path: typesOutputDir,
            mode: { type: "downloadFiles" as const }
        },
        customConfig: { crateName: typesCrateName.replace(/-/g, "_") },
        workspaceName: binaryName,
        organization: "",
        environment: { _type: "local" as const, type: "local" as const },
        dryRun: false,
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false,
        generatePaginatedClients: false
    };

    const configPath = path.join(typesOutputDir, ".generator-config.json");
    await writeFile(configPath, JSON.stringify(generatorConfig, null, 2));

    const cliEntryPoint = resolveRustModelCli();

    try {
        await execFileAsync("node", ["--enable-source-maps", cliEntryPoint, configPath], {
            cwd: typesOutputDir,
            timeout: 120_000,
            env: { ...process.env }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Embedded types generation failed: ${message}`);
    } finally {
        // Best-effort cleanup; file may already be absent if the subprocess moved it.
        await unlink(configPath).catch((_e: unknown) => undefined);
    }

    // The rust-model generator only emits .rs source files — it does not
    // produce Cargo.toml or the prelude module that its types import.
    // Patch the crate so it compiles as a workspace member.
    await patchTypesCrate({ typesOutputDir, typesCrateName });

    return typesCrateName;
}

/**
 * Write the scaffolding files that the rust-model generator does not
 * produce: `Cargo.toml`, `src/prelude.rs`, and a `pub mod prelude;`
 * declaration in `src/lib.rs`.
 *
 * Also detects references to `crate::core::` helper modules (e.g.
 * `flexible_datetime`, `base64_bytes`) in generated type files and
 * copies those modules into the types crate with the necessary
 * dependencies.
 *
 * Also cleans up the `.fern/` metadata directory that the base generator
 * framework writes — it's useful for standalone crates but noise inside
 * the CLI workspace.
 */
async function patchTypesCrate(args: { typesOutputDir: string; typesCrateName: string }): Promise<void> {
    const { typesOutputDir, typesCrateName } = args;
    const crateName = typesCrateName.replace(/-/g, "_");

    // Detect which crate::core:: modules the generated types reference.
    const coreModules = await detectCoreModuleReferences(path.join(typesOutputDir, "src"));

    // 1. Cargo.toml — minimal lib crate with serde derives + any
    //    additional deps required by detected core modules.
    const depLines = ['serde = { version = "1", features = ["derive"] }', 'serde_json = "1"'];
    if (coreModules.has("flexible_datetime")) {
        depLines.push('chrono = { version = "0.4", features = ["serde"] }');
    }
    if (coreModules.has("base64_bytes")) {
        depLines.push('base64 = "0.22"');
    }
    if (coreModules.has("bigint_string")) {
        depLines.push('num-bigint = "0.4"');
        depLines.push('num-traits = "0.2"');
    }

    const cargoToml = [
        "[package]",
        `name = "${crateName}"`,
        'version = "0.0.0"',
        'edition = "2021"',
        "",
        "[lib]",
        "doctest = false",
        "",
        "[dependencies]",
        ...depLines,
        ""
    ].join("\n");
    await writeFile(path.join(typesOutputDir, "Cargo.toml"), cargoToml);

    // 2. src/prelude.rs — re-exports the derives that every generated
    //    type file imports via `use crate::prelude::*`.
    const preludeLines = [
        "pub use serde::{Deserialize, Serialize};",
        "pub use serde_json::{json, Value};",
        "pub use std::collections::{HashMap, HashSet};",
        "pub use std::fmt;"
    ];

    // If the rust-model generator emitted an error.rs with BuildError,
    // re-export it so type files that reference BuildError (builders)
    // can resolve it via `use crate::prelude::*`.
    const errorRsPath = path.join(typesOutputDir, "src", "error.rs");
    let hasErrorRs = false;
    try {
        await readFile(errorRsPath);
        hasErrorRs = true;
    } catch (_e: unknown) {
        // no error.rs — skip
    }
    if (hasErrorRs) {
        preludeLines.push("pub use crate::error::BuildError;");
    }

    // Re-export chrono types into prelude when datetime modules are used.
    if (coreModules.has("flexible_datetime")) {
        preludeLines.push("pub use chrono::{DateTime, FixedOffset, NaiveDate, NaiveDateTime, Utc};");
    }

    preludeLines.push("");
    await writeFile(path.join(typesOutputDir, "src", "prelude.rs"), preludeLines.join("\n"));

    // 3. Inject `pub mod prelude;` into lib.rs (right after the header
    //    comment, before any other module declarations).
    const libPath = path.join(typesOutputDir, "src", "lib.rs");
    const libContent = await readFile(libPath, "utf-8");
    if (!libContent.includes("pub mod prelude;")) {
        const patched = libContent.replace(
            "//! Generated models by Fern\n",
            "//! Generated models by Fern\n\npub mod prelude;\n"
        );
        await writeFile(libPath, patched);
    }

    // 3b. If core modules are needed, copy them and declare `pub mod core;`.
    if (coreModules.size > 0) {
        await copyCoreModules(typesOutputDir, coreModules);
        // Inject `pub mod core;` into lib.rs.
        const updatedLib = await readFile(libPath, "utf-8");
        if (!updatedLib.includes("pub mod core;")) {
            const patchedWithCore = updatedLib.replace("pub mod prelude;\n", "pub mod prelude;\npub mod core;\n");
            await writeFile(libPath, patchedWithCore);
        }
    }

    // 4. Move generated type files into `src/types/` so `lib.rs`'s
    //    `pub mod types;` resolves to `src/types/mod.rs`. The rust-model
    //    generator emits `mod.rs` + per-type `.rs` files flat in `src/`;
    //    Rust expects either `src/types.rs` or `src/types/mod.rs`.
    await restructureTypesModule(path.join(typesOutputDir, "src"));

    // 5. Remove the .fern/ metadata directory written by the base
    //    generator framework — not needed inside a workspace member.
    await rm(path.join(typesOutputDir, ".fern"), { recursive: true, force: true });
}

/** Files/dirs that live at the `src/` root and must NOT be moved into `src/types/`. */
const SRC_ROOT_FILES = new Set(["lib.rs", "prelude.rs", "error.rs"]);

/**
 * Known `crate::core::` helper modules that the rust-model generator may
 * reference in generated type files via `#[serde(with = "crate::core::...")]`.
 */
const CORE_MODULE_DEFS: Record<string, { filename: string }> = {
    flexible_datetime: { filename: "flexible_datetime.rs" },
    base64_bytes: { filename: "base64_bytes.rs" },
    bigint_string: { filename: "bigint_string.rs" },
    number_serializers: { filename: "number_serializers.rs" }
};

/**
 * Scan all `.rs` files under `srcDir` for references to `crate::core::<module>`
 * and return the set of module names that are actually used.
 */
async function detectCoreModuleReferences(srcDir: string): Promise<Set<string>> {
    const found = new Set<string>();
    const files = await collectRsFiles(srcDir);
    for (const filePath of files) {
        const content = await readFile(filePath, "utf-8");
        for (const moduleName of Object.keys(CORE_MODULE_DEFS)) {
            if (content.includes(`crate::core::${moduleName}`)) {
                found.add(moduleName);
            }
        }
    }
    return found;
}

/**
 * Recursively collect all `.rs` file paths under a directory.
 */
async function collectRsFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...(await collectRsFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith(".rs")) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Copy the needed core helper modules into `<typesOutputDir>/src/core/`
 * and write a `mod.rs` that declares them.
 *
 * The source files are read from the rust-model generator's bundled
 * `asIs/` directory (copied there by `build.mjs`).
 */
async function copyCoreModules(typesOutputDir: string, modules: Set<string>): Promise<void> {
    const coreDir = path.join(typesOutputDir, "src", "core");
    await mkdir(coreDir, { recursive: true });

    const asIsDir = resolveAsIsDirectory();
    const modLines: string[] = [];

    for (const moduleName of modules) {
        const def = CORE_MODULE_DEFS[moduleName];
        if (def == null) {
            continue;
        }
        const srcFile = path.join(asIsDir, def.filename);
        const destFile = path.join(coreDir, def.filename);
        await cp(srcFile, destFile);
        modLines.push(`pub mod ${moduleName};`);
    }

    // Write core/mod.rs
    modLines.push("");
    await writeFile(path.join(coreDir, "mod.rs"), modLines.join("\n"));
}

/**
 * Resolve the `asIs/` directory containing the static Rust helper modules.
 *
 * Resolution order (mirrors `resolveRustModelCli`):
 *   1. Docker: `<scriptDir>/rust-model-dist/asIs/`
 *   2. Monorepo dev: `@fern-api/rust-model` package's `dist/asIs/` or
 *      the base package's `src/asIs/`.
 */
function resolveAsIsDirectory(): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");

    // 1. Docker / dist:cli build — asIs/ lives next to the bundled model CLI.
    const bundled = path.resolve(scriptDir, "rust-model-dist", "asIs");
    try {
        accessSync(bundled, constants.R_OK);
        return bundled;
    } catch (_e: unknown) {
        // fall through
    }

    // 2. Monorepo dev — resolve via @fern-api/rust-model dist/asIs or
    //    fall back to @fern-api/rust-base src/asIs.
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const base = import.meta.url || (typeof __filename !== "undefined" ? `file://${__filename}` : "file:///");
        const require = createRequire(base);
        const modelPkg = require.resolve("@fern-api/rust-model/package.json");
        const modelRoot = path.dirname(modelPkg);
        const modelAsIs = path.join(modelRoot, "dist", "asIs");
        try {
            accessSync(modelAsIs, constants.R_OK);
            return modelAsIs;
        } catch (_e: unknown) {
            // dist not built yet — try source
        }
        // In development the base package's asIs dir is the canonical source.
        const baseAsIs = path.resolve(modelRoot, "..", "base", "src", "asIs");
        accessSync(baseAsIs, constants.R_OK);
        return baseAsIs;
    } catch (_e: unknown) {
        // fall through
    }

    throw new Error(
        "Could not resolve the asIs/ directory for core helper modules. " +
            "Ensure `pnpm turbo run dist:cli --filter @fern-api/rust-model` has been run."
    );
}

/**
 * Move all generated type `.rs` files (and `mod.rs`) into a `types/`
 * subdirectory so that `lib.rs`'s `pub mod types;` resolves correctly
 * to `src/types/mod.rs`. Files listed in `SRC_ROOT_FILES` stay put.
 *
 * After moving, each type file (not `mod.rs`) gets a `use super::*;`
 * injected so sibling types re-exported by `mod.rs` are in scope.
 */
async function restructureTypesModule(srcDir: string): Promise<void> {
    const typesDir = path.join(srcDir, "types");
    await mkdir(typesDir, { recursive: true });

    const movedFiles: string[] = [];
    const entries = await readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }
        if (SRC_ROOT_FILES.has(entry.name)) {
            continue;
        }
        if (!entry.name.endsWith(".rs")) {
            continue;
        }
        const src = path.join(srcDir, entry.name);
        const dest = path.join(typesDir, entry.name === "mod.rs" ? "mod.rs" : entry.name);
        await rename(src, dest);
        if (entry.name !== "mod.rs") {
            movedFiles.push(dest);
        }
    }

    // Inject `use super::*;` into each moved type file so sibling types
    // (re-exported by mod.rs) are visible alongside prelude imports.
    for (const filePath of movedFiles) {
        const content = await readFile(filePath, "utf-8");
        if (!content.includes("use super::*;")) {
            const patched = content.replace("pub use crate::prelude::*;", "pub use crate::prelude::*;\nuse super::*;");
            if (patched !== content) {
                await writeFile(filePath, patched);
            }
        }
    }
}

/**
 * Resolve the rust-model generator's CLI entry point.
 *
 * Resolution order:
 *   1. Bundled `rust-model-cli.cjs` next to the CLI generator's own
 *      bundled entry (Docker image, after `build.mjs` copies it).
 *   2. Monorepo workspace — `@fern-api/rust-model` package's compiled
 *      `lib/cli.js` (development, after `pnpm compile`).
 */
function resolveRustModelCli(): string {
    // Resolve the directory containing this script. In the CJS bundle
    // `import.meta` is empty so we fall back to Node's native `__dirname`.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");

    // 1. Docker / dist:cli build — bundled in dist/rust-model-dist/
    const bundled = path.resolve(scriptDir, "rust-model-dist", "cli.cjs");
    try {
        accessSync(bundled, constants.R_OK);
        return bundled;
    } catch (_e: unknown) {
        // Not found — fall through to monorepo resolution.
    }

    // 2. Monorepo dev — resolve via pnpm workspace link.
    try {
        // In CJS import.meta.url is empty; use __filename for createRequire.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const base = import.meta.url || (typeof __filename !== "undefined" ? `file://${__filename}` : "file:///");
        const require = createRequire(base);
        const modelPkg = require.resolve("@fern-api/rust-model/package.json");
        const modelRoot = path.dirname(modelPkg);
        const devEntry = path.join(modelRoot, "lib", "cli.js");
        accessSync(devEntry, constants.R_OK);
        return devEntry;
    } catch (_e: unknown) {
        // fall through
    }

    throw new Error(
        "Could not resolve the @fern-api/rust-model CLI. " +
            "Ensure `pnpm turbo run dist:cli --filter @fern-api/rust-model` has been run, " +
            "or that @fern-api/rust-model is installed in the workspace."
    );
}
