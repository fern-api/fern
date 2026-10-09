/**
 * Shared scaffolding for the generated types crates.
 *
 * The rust-model generator emits only `.rs` type modules, so the CLI generator
 * has to supply everything that makes them a crate: the manifest, the prelude
 * every generated file imports, `lib.rs`, and the serde helper modules that
 * `#[serde(with = "crate::core::...")]` attributes resolve to. Both the single
 * types crate and each crate produced by splitting need all of it.
 */

import { accessSync, constants } from "fs";
import { copyFile, mkdir, writeFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";

/** Directory under `src/` that holds the generated type modules. */
export const TYPES_MODULE_DIRECTORY = "types";

/**
 * Directory *inside the facade crate* that holds the per-API type crates when
 * partitioning is on, i.e. `<binary>-types/crates/<binary>-types-<api>/`.
 *
 * A large workspace produces one crate per API — 60+ for some consumers — and
 * leaving those at the output root buries everything else in the generated repo.
 * Nesting them under the facade means enabling the flag adds no top-level entry
 * at all: the tree looks exactly as it did with a single types crate, and the
 * partitions are found where they belong, inside the crate that re-exports them.
 *
 * Cargo permits a package to depend on one in its own subdirectory, which is
 * what makes this legal.
 */
export const PARTITION_CRATES_DIRECTORY = "crates";

interface CargoPathDependency {
    /** Package name, i.e. the crate name in snake_case. */
    crateName: string;
    /** Relative path from the depending crate's directory. */
    path: string;
}

/**
 * `Cargo.toml` for a generated types crate.
 *
 * A facade crate sets `includeSerdeDependencies: false`: it only re-exports
 * other crates, so pulling in serde and friends would make it needlessly
 * expensive to compile.
 */
export function buildTypesCrateCargoToml({
    crateName,
    needsReqwest,
    includeSerdeDependencies = true,
    pathDependencies = []
}: {
    crateName: string;
    needsReqwest: boolean;
    includeSerdeDependencies?: boolean;
    pathDependencies?: CargoPathDependency[];
}): string {
    const deps: string[] = [];
    if (includeSerdeDependencies) {
        deps.push(
            'serde = { version = "1", features = ["derive"] }',
            'serde_json = "1"',
            'chrono = { version = "0.4", features = ["serde"] }',
            'base64 = "0.22"',
            'num-bigint = { version = "0.4", features = ["serde"] }',
            'ordered-float = { version = "4.5", features = ["serde"] }'
        );
    }
    if (needsReqwest) {
        deps.push('reqwest = { version = "0.12", features = ["multipart"], default-features = false }');
    }

    const lines = [
        "[package]",
        `name = "${crateName}"`,
        'version = "0.0.0"',
        'edition = "2021"',
        "",
        "[lib]",
        "doctest = false",
        "",
        "[dependencies]",
        ...deps,
        ""
    ];
    // Sub-tables must follow the key/value pairs of `[dependencies]`, since
    // everything after a table header belongs to that table.
    for (const dependency of pathDependencies) {
        lines.push(`[dependencies.${dependency.crateName}]`, `path = "${dependency.path}"`, "");
    }
    return lines.join("\n");
}

/**
 * `src/prelude.rs` for a generated types crate. Every generated type file
 * imports this via `use crate::prelude::*`, which is how bare type references
 * resolve — including references to types that live in another crate.
 */
export function buildTypesCratePrelude({
    hasErrorModule,
    reexportTypesFromCrate
}: {
    hasErrorModule: boolean;
    /** Crate whose types should also be in scope, i.e. the shared core crate. */
    reexportTypesFromCrate?: string;
}): string {
    const lines = [
        "pub use serde::{Deserialize, Serialize};",
        "pub use serde_json::{json, Value};",
        "pub use std::collections::{HashMap, HashSet};",
        "pub use std::fmt;",
        "pub use chrono::{DateTime, FixedOffset, NaiveDate, NaiveDateTime, Utc};",
        "pub use ordered_float::OrderedFloat;"
    ];
    if (hasErrorModule) {
        lines.push("pub use crate::error::BuildError;");
    }
    if (reexportTypesFromCrate != null) {
        lines.push(`pub use ${reexportTypesFromCrate}::${TYPES_MODULE_DIRECTORY}::*;`);
    }
    lines.push("");
    return lines.join("\n");
}

/**
 * `src/lib.rs` for a generated types crate, matching what the model generator
 * emits plus the modules {@link patchTypesCrate} injects.
 */
export function buildTypesCrateLibRs({ hasTypes }: { hasTypes: boolean }): string {
    const lines = ["//! Generated models by Fern", "", "pub mod core;", "pub mod prelude;", "", "pub mod error;", ""];
    if (hasTypes) {
        lines.push(`pub mod ${TYPES_MODULE_DIRECTORY};`, "", `pub use ${TYPES_MODULE_DIRECTORY}::*;`);
    }
    lines.push("");
    return lines.join("\n");
}

/** The four core serde helper modules that the model generator references. */
const CORE_SERDE_MODULES = ["flexible_datetime.rs", "base64_bytes.rs", "bigint_string.rs", "number_serializers.rs"];

/**
 * `src/core/mod.rs` for a crate that borrows the serde helpers from the shared
 * crate instead of carrying its own copy.
 *
 * Re-exports the modules rather than their items, because generated types reach
 * into them by path — `#[serde(with = "crate::core::flexible_datetime::offset::
 * option")]` — and only a module re-export keeps the nested segments resolving.
 */
export function buildCoreModuleReexport(coreCrateName: string): string {
    const lines = [
        "//! Serde helpers, shared with the rest of the generated workspace.",
        "//!",
        "//! Re-exported from the core crate so that this crate's",
        '//! `#[serde(with = "crate::core::...")]` attributes resolve without each',
        "//! crate compiling its own copy of them.",
        ""
    ];
    for (const filename of CORE_SERDE_MODULES) {
        lines.push(`pub use ${coreCrateName}::core::${filename.replace(".rs", "")};`);
    }
    lines.push("");
    return lines.join("\n");
}

/**
 * `src/error.rs` for a crate that borrows `BuildError` from the shared crate.
 *
 * One definition for the whole workspace, so a builder error raised in one
 * crate is the same type as one raised in another — which it would not be if
 * every crate declared its own.
 */
export function buildErrorModuleReexport(coreCrateName: string): string {
    return [
        "//! Builder errors, shared with the rest of the generated workspace.",
        "",
        `pub use ${coreCrateName}::error::*;`,
        ""
    ].join("\n");
}

/**
 * Copy the core serde helper modules into the types crate's `src/core/`
 * directory and write a `mod.rs` that declares them.
 */
export async function copyCoreModules(typesOutputDir: string): Promise<void> {
    const coreDir = path.join(typesOutputDir, "src", "core");
    await mkdir(coreDir, { recursive: true });

    const asIsDir = resolveAsIsDir();
    for (const filename of CORE_SERDE_MODULES) {
        await copyFile(path.join(asIsDir, filename), path.join(coreDir, filename));
    }

    const modLines = CORE_SERDE_MODULES.map((f) => `pub mod ${f.replace(".rs", "")};`);
    modLines.push("");
    await writeFile(path.join(coreDir, "mod.rs"), modLines.join("\n"));
}

/**
 * Resolve the directory containing the as-is Rust helper files
 * (`flexible_datetime.rs`, `base64_bytes.rs`, etc.).
 *
 * Resolution order:
 *   1. Docker / dist:cli — `dist/rust-model-dist/asIs/` (bundled).
 *   2. Monorepo dev — `@fern-api/rust-base` package's `src/asIs/`.
 */
function resolveAsIsDir(): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const scriptDir: string = import.meta.dirname ?? (typeof __dirname !== "undefined" ? __dirname : ".");

    // 1. Docker / dist:cli build — bundled alongside rust-model-dist.
    const bundled = path.resolve(scriptDir, "rust-model-dist", "asIs");
    try {
        accessSync(path.join(bundled, "flexible_datetime.rs"), constants.R_OK);
        return bundled;
    } catch (_e: unknown) {
        // Not found — fall through.
    }

    // 2. Monorepo dev — resolve via @fern-api/rust-base.
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const base = import.meta.url || (typeof __filename !== "undefined" ? `file://${__filename}` : "file:///");
        const require = createRequire(base);
        // Resolve the package entry rather than its package.json: rust-base's
        // `exports` map does not expose the latter.
        const baseEntry = require.resolve("@fern-api/rust-base");
        const devAsIs = path.resolve(path.dirname(baseEntry), "..", "src", "asIs");
        accessSync(path.join(devAsIs, "flexible_datetime.rs"), constants.R_OK);
        return devAsIs;
    } catch (_e: unknown) {
        // fall through
    }

    throw new Error(
        "Could not resolve Rust core as-is files. " +
            "Ensure `pnpm turbo run dist:cli --filter @fern-api/rust-model` has been run, " +
            "or that @fern-api/rust-base is installed in the workspace."
    );
}
