/**
 * Split the generated `<binary>-types` crate into one crate per API.
 *
 * A single crate holding every generated type is one `rustc` compilation
 * unit, and the front end (type-checking plus serde-derive expansion) holds
 * that whole unit in memory at once. For a workspace with many specs the peak
 * exceeds what a standard CI runner has, so the build is killed. Cargo
 * compiles each crate in a separate process and reclaims memory in between,
 * which caps the peak at the largest single crate instead of the sum.
 *
 * The original crate name is kept as a facade that re-exports every partition,
 * so `use <binary>_types::SomeType;` keeps resolving and neither the generated
 * SDK crate nor any `.fernignore`d handler needs to change.
 */

import { MODEL_FILE_MANIFEST_PATH, ModelFileManifestModule } from "@fern-api/rust-model";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { CORE_PARTITION_KEY, TypeCratePartitionPlan } from "./planTypeCratePartitions.js";
import {
    buildCoreModuleReexport,
    buildErrorModuleReexport,
    buildTypesCrateCargoToml,
    buildTypesCrateLibRs,
    buildTypesCratePrelude,
    copyCoreModules,
    PARTITION_CRATES_DIRECTORY,
    TYPES_MODULE_DIRECTORY
} from "./typesCrateScaffolding.js";

export interface TypePartitionCrate {
    /** Cargo package name, kebab-case. */
    crateName: string;
    /**
     * Directory relative to the output root, e.g.
     * `<binary>-types/crates/<crateName>`. Distinct from
     * {@link TypePartitionCrate.crateName} because the crates are nested inside
     * the facade: callers that resolve a path need this, callers that need the
     * lockfile's package name need the crate name.
     */
    relativeDir: string;
}

export interface SplitTypesCratesResult {
    /** Crate the SDK depends on. Re-exports every partition. */
    facadeCrateName: string;
    /** Partition crates, in workspace-member order (core first). */
    partitionCrates: TypePartitionCrate[];
}

export async function splitTypesCrates(args: {
    /** The already-generated single types crate, which becomes the facade. */
    typesOutputDir: string;
    typesCrateName: string;
    plan: TypeCratePartitionPlan;
    needsReqwest: boolean;
}): Promise<SplitTypesCratesResult> {
    const { typesOutputDir, typesCrateName, plan, needsReqwest } = args;
    const manifest = await readModelFileManifest(typesOutputDir);
    const modulesByPartition = groupModulesByPartition({ manifest, plan });

    const crateNamesByPartition = resolveCrateNames({ typesCrateName, partitionKeys: [...modulesByPartition.keys()] });
    const coreCrateName = requireCoreCrateName(crateNamesByPartition);

    // Whether core owns any types, as opposed to existing only to host
    // `BuildError` and the serde helpers. An API whose specs share nothing
    // between them — which is the normal shape for a namespaced multi-spec
    // workspace — produces exactly that: a core crate with no types at all.
    const coreOwnsTypes = (modulesByPartition.get(CORE_PARTITION_KEY) ?? []).length > 0;

    const partitionCrates: TypePartitionCrate[] = [];
    for (const [partitionKey, crateName] of crateNamesByPartition) {
        const modules = modulesByPartition.get(partitionKey) ?? [];
        await writePartitionCrate({
            crateDir: path.join(typesOutputDir, PARTITION_CRATES_DIRECTORY, crateName),
            crateName,
            modules,
            sourceTypesDir: path.join(typesOutputDir, "src", TYPES_MODULE_DIRECTORY),
            monolithSrcDir: path.join(typesOutputDir, "src"),
            // Leaves resolve shared types, `BuildError` and the serde helpers
            // through core; core depends on nothing, which is what keeps the
            // cargo dependency graph acyclic.
            dependsOnCoreCrate: partitionKey === CORE_PARTITION_KEY ? undefined : coreCrateName,
            // Only pull core's types into the leaf prelude if there are any.
            // Globbing an empty module is an `unused_imports` warning in every
            // leaf, which on a 60-spec workspace means 60 warnings in the
            // consumer's build for no benefit.
            reexportCoreTypes: coreOwnsTypes,
            needsReqwest
        });
        partitionCrates.push({
            crateName,
            relativeDir: `${typesCrateName}/${PARTITION_CRATES_DIRECTORY}/${crateName}`
        });
    }

    await writeFacadeCrate({
        typesOutputDir,
        typesCrateName,
        partitionCrates,
        coreCrateName,
        // Same reason as the leaf preludes: re-exporting an empty `types`
        // module is an unused import, so the facade skips any crate that owns
        // no types. In practice that is only ever core.
        crateNamesOwningTypes: new Set(
            [...crateNamesByPartition]
                .filter(([partitionKey]) => (modulesByPartition.get(partitionKey) ?? []).length > 0)
                .map(([, crateName]) => crateName)
        )
    });

    return { facadeCrateName: typesCrateName, partitionCrates };
}

async function readModelFileManifest(typesOutputDir: string): Promise<ModelFileManifestModule[]> {
    const manifestPath = path.join(typesOutputDir, MODEL_FILE_MANIFEST_PATH);
    let raw: string;
    try {
        raw = await readFile(manifestPath, "utf-8");
    } catch (_e: unknown) {
        throw new Error(
            `Cannot split the types crate: the model generator did not write ${MODEL_FILE_MANIFEST_PATH}. ` +
                "This indicates the rust-model generator was invoked without `emitFileManifest`."
        );
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null || !("modules" in parsed)) {
        throw new Error(`Malformed model file manifest at ${manifestPath}: expected an object with a "modules" key.`);
    }
    const { modules } = parsed as { modules: unknown };
    if (!Array.isArray(modules)) {
        throw new Error(`Malformed model file manifest at ${manifestPath}: "modules" must be an array.`);
    }
    return modules as ModelFileManifestModule[];
}

/**
 * Assign each generated module to a partition using the plan's ownership of
 * the IR element that produced it. Anything the plan does not mention lands in
 * core, which every other crate can see.
 */
function groupModulesByPartition({
    manifest,
    plan
}: {
    manifest: ModelFileManifestModule[];
    plan: TypeCratePartitionPlan;
}): Map<string, ModelFileManifestModule[]> {
    const partitionByTypeId = new Map<string, string>();
    const partitionByEndpointId = new Map<string, string>();
    for (const partition of [plan.core, ...plan.leaves]) {
        for (const typeId of partition.typeIds) {
            partitionByTypeId.set(typeId, partition.key);
        }
        for (const endpointId of partition.endpointIds) {
            partitionByEndpointId.set(endpointId, partition.key);
        }
    }

    const modulesByPartition = new Map<string, ModelFileManifestModule[]>();
    for (const moduleExport of manifest) {
        const partitionKey =
            (moduleExport.owner.kind === "type"
                ? partitionByTypeId.get(moduleExport.owner.typeId)
                : partitionByEndpointId.get(moduleExport.owner.endpointId)) ?? CORE_PARTITION_KEY;
        const modules = modulesByPartition.get(partitionKey);
        if (modules == null) {
            modulesByPartition.set(partitionKey, [moduleExport]);
        } else {
            modules.push(moduleExport);
        }
    }
    return modulesByPartition;
}

async function writePartitionCrate(args: {
    crateDir: string;
    crateName: string;
    modules: ModelFileManifestModule[];
    sourceTypesDir: string;
    monolithSrcDir: string;
    dependsOnCoreCrate: string | undefined;
    reexportCoreTypes: boolean;
    needsReqwest: boolean;
}): Promise<void> {
    const {
        crateDir,
        crateName,
        modules,
        sourceTypesDir,
        monolithSrcDir,
        dependsOnCoreCrate,
        reexportCoreTypes,
        needsReqwest
    } = args;
    const srcDir = path.join(crateDir, "src");
    const typesDir = path.join(srcDir, TYPES_MODULE_DIRECTORY);
    await mkdir(typesDir, { recursive: true });

    for (const moduleExport of modules) {
        await rename(path.join(sourceTypesDir, moduleExport.filename), path.join(typesDir, moduleExport.filename));
    }

    await writeFile(path.join(typesDir, "mod.rs"), buildPartitionTypesModRs(modules));
    // A crate with no types of its own declares no `types` module: `pub use
    // types::*` over an empty module is an unused import. Only core is ever
    // empty, and only when no type is shared between APIs.
    await writeFile(path.join(srcDir, "lib.rs"), buildTypesCrateLibRs({ hasTypes: modules.length > 0 }));

    // `BuildError` and the serde helpers are declared once, in core, and
    // re-exported by every leaf. Copying them per crate instead would compile
    // the same ~750 lines once per API and — worse — give each crate its own
    // `BuildError`, so a builder error from one API would not be the same type
    // as one from another.
    if (dependsOnCoreCrate == null) {
        await copyBuildErrorModule({ monolithSrcDir, srcDir });
        await copyCoreModules(crateDir);
    } else {
        const coreCrate = toSnakeCase(dependsOnCoreCrate);
        await writeFile(path.join(srcDir, "error.rs"), buildErrorModuleReexport(coreCrate));
        await mkdir(path.join(srcDir, "core"), { recursive: true });
        await writeFile(path.join(srcDir, "core", "mod.rs"), buildCoreModuleReexport(coreCrate));
    }
    await writeFile(
        path.join(srcDir, "prelude.rs"),
        buildTypesCratePrelude({
            hasErrorModule: true,
            // Bare references to shared types resolve through the prelude, so
            // core's types must be in scope in every leaf — but only when core
            // actually has some, or the glob is an unused import.
            reexportTypesFromCrate:
                dependsOnCoreCrate == null || !reexportCoreTypes ? undefined : toSnakeCase(dependsOnCoreCrate)
        })
    );
    await writeFile(
        path.join(crateDir, "Cargo.toml"),
        buildTypesCrateCargoToml({
            crateName: toSnakeCase(crateName),
            needsReqwest,
            pathDependencies:
                dependsOnCoreCrate == null
                    ? []
                    : [{ crateName: toSnakeCase(dependsOnCoreCrate), path: `../${dependsOnCoreCrate}` }]
        })
    );
}

/**
 * Turn the original crate directory into a facade: drop the generated modules
 * it no longer owns and re-export the partitions instead.
 */
async function writeFacadeCrate(args: {
    typesOutputDir: string;
    typesCrateName: string;
    partitionCrates: TypePartitionCrate[];
    coreCrateName: string;
    crateNamesOwningTypes: ReadonlySet<string>;
}): Promise<void> {
    const { typesOutputDir, typesCrateName, partitionCrates, coreCrateName, crateNamesOwningTypes } = args;
    const srcDir = path.join(typesOutputDir, "src");

    // A facade holds no derives or type definitions, so it stays cheap to
    // compile and does not reintroduce the peak this split exists to remove.
    for (const entry of await readdir(srcDir)) {
        await rm(path.join(srcDir, entry), { recursive: true, force: true });
    }
    await rm(path.join(typesOutputDir, ".fern"), { recursive: true, force: true });

    const libLines = [
        "//! Generated models by Fern",
        "//!",
        "//! Re-exports the per-API type crates so that every generated type",
        "//! remains reachable from this crate's root.",
        ""
    ];
    // Re-export each partition's `types` module rather than its crate root.
    // Every partition crate also declares `core`, `prelude` and `error`, and
    // glob-re-exporting those from more than one crate makes each of those names
    // ambiguous at the facade: rustc warns (`ambiguous_glob_reexports`) on every
    // build of the consumer's CLI, and any consumer who names one — or builds
    // with `-D warnings` — fails outright. Only the generated types need to
    // reach the facade, and their names are unique across the whole IR.
    for (const { crateName } of partitionCrates) {
        if (!crateNamesOwningTypes.has(crateName)) {
            continue;
        }
        libLines.push(`pub use ${toSnakeCase(crateName)}::${TYPES_MODULE_DIRECTORY}::*;`);
    }
    // `core`, `error` and `prelude` are declared once in the core crate, so
    // naming them here is unambiguous. This keeps the facade's module surface
    // identical to the un-split crate's, so `<binary>_types::error::BuildError`
    // and friends resolve the same way whether or not splitting is enabled.
    libLines.push("");
    for (const moduleName of ["core", "error", "prelude"]) {
        libLines.push(`pub use ${toSnakeCase(coreCrateName)}::${moduleName};`);
    }
    libLines.push("");
    await writeFile(path.join(srcDir, "lib.rs"), libLines.join("\n"));

    await writeFile(
        path.join(typesOutputDir, "Cargo.toml"),
        buildTypesCrateCargoToml({
            crateName: toSnakeCase(typesCrateName),
            needsReqwest: false,
            includeSerdeDependencies: false,
            // The partitions live inside this crate's own directory, so the
            // paths are relative to it and carry no `../`. Leaf -> core paths
            // are `../<core>`: those crates are siblings inside `crates/`.
            pathDependencies: partitionCrates.map(({ crateName }) => ({
                crateName: toSnakeCase(crateName),
                path: `${PARTITION_CRATES_DIRECTORY}/${crateName}`
            }))
        })
    );
}

function buildPartitionTypesModRs(modules: ModelFileManifestModule[]): string {
    const lines = ["//! Request and response types generated by Fern", ""];
    for (const { moduleName } of modules) {
        lines.push(`pub mod ${moduleName};`);
    }
    lines.push("");
    for (const { moduleName, typeName } of modules) {
        lines.push(`pub use ${moduleName}::${typeName};`);
    }
    lines.push("");
    return lines.join("\n");
}

async function copyBuildErrorModule({
    monolithSrcDir,
    srcDir
}: {
    monolithSrcDir: string;
    srcDir: string;
}): Promise<void> {
    const contents = await readFile(path.join(monolithSrcDir, "error.rs"), "utf-8");
    await writeFile(path.join(srcDir, "error.rs"), contents);
}

/**
 * Name one crate per partition, keyed by partition. Iteration order is the
 * order the crates must be written and declared in: the shared core crate
 * first, since every other crate depends on it, then the leaves sorted by key
 * so a given IR always produces the same workspace.
 *
 * The core crate is always named, even when the plan gave it no types of its
 * own: it is where `BuildError` and the serde helpers live, so every other
 * crate depends on it regardless.
 *
 * Crate names are derived from partition keys, which are fern filepaths and so
 * admit characters a crate name cannot contain. Sanitising can map two
 * distinct keys onto one name, so collisions are disambiguated with a numeric
 * suffix rather than silently overwriting the other crate's directory. A
 * subpackage literally named `core` cannot reach this function — the planner
 * folds it into the shared partition — but the suffixing covers it either way.
 */
function resolveCrateNames({
    typesCrateName,
    partitionKeys
}: {
    typesCrateName: string;
    partitionKeys: string[];
}): Map<string, string> {
    const orderedKeys = partitionKeys.filter((key) => key !== CORE_PARTITION_KEY).sort((a, b) => a.localeCompare(b));
    orderedKeys.unshift(CORE_PARTITION_KEY);

    const crateNames = new Map<string, string>();
    const taken = new Set<string>();
    for (const partitionKey of orderedKeys) {
        const base = `${typesCrateName}-${toCrateNameSegment(partitionKey)}`;
        let crateName = base;
        for (let suffix = 2; taken.has(crateName); suffix++) {
            crateName = `${base}-${suffix}`;
        }
        taken.add(crateName);
        crateNames.set(partitionKey, crateName);
    }
    return crateNames;
}

/**
 * {@link resolveCrateNames} always names a core crate, so this only guards
 * against that contract being broken later — every leaf depends on core for
 * `BuildError` and the serde helpers, and emitting one without it produces a
 * crate whose generated types cannot compile.
 */
function requireCoreCrateName(crateNamesByPartition: Map<string, string>): string {
    const coreCrateName = crateNamesByPartition.get(CORE_PARTITION_KEY);
    if (coreCrateName == null) {
        throw new Error("Cannot split the types crate: no core crate was named for the shared modules.");
    }
    return coreCrateName;
}

function toCrateNameSegment(partitionKey: string): string {
    return partitionKey
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

function toSnakeCase(crateName: string): string {
    return crateName.replace(/-/g, "_");
}
