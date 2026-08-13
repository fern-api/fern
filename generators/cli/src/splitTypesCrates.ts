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
    buildTypesCrateCargoToml,
    buildTypesCrateLibRs,
    buildTypesCratePrelude,
    copyCoreModules,
    TYPES_MODULE_DIRECTORY
} from "./typesCrateScaffolding.js";

export interface SplitTypesCratesResult {
    /** Crate the SDK depends on. Re-exports every partition. */
    facadeCrateName: string;
    /** Partition crates, in workspace-member order (core first, if present). */
    partitionCrateNames: string[];
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

    const outputDir = path.dirname(typesOutputDir);
    const crateNamesByPartition = resolveCrateNames({ typesCrateName, partitionKeys: [...modulesByPartition.keys()] });
    const coreCrateName = crateNamesByPartition.get(CORE_PARTITION_KEY);

    const partitionCrateNames: string[] = [];
    for (const [partitionKey, crateName] of crateNamesByPartition) {
        const modules = modulesByPartition.get(partitionKey) ?? [];
        await writePartitionCrate({
            crateDir: path.join(outputDir, crateName),
            crateName,
            modules,
            sourceTypesDir: path.join(typesOutputDir, "src", TYPES_MODULE_DIRECTORY),
            monolithSrcDir: path.join(typesOutputDir, "src"),
            // Leaves resolve shared types through core; core depends on nothing,
            // which is what keeps the cargo dependency graph acyclic.
            dependsOnCoreCrate: partitionKey === CORE_PARTITION_KEY ? undefined : coreCrateName,
            needsReqwest
        });
        partitionCrateNames.push(crateName);
    }

    await writeFacadeCrate({ typesOutputDir, typesCrateName, partitionCrateNames });

    return { facadeCrateName: typesCrateName, partitionCrateNames };
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
    needsReqwest: boolean;
}): Promise<void> {
    const { crateDir, crateName, modules, sourceTypesDir, monolithSrcDir, dependsOnCoreCrate, needsReqwest } = args;
    const srcDir = path.join(crateDir, "src");
    const typesDir = path.join(srcDir, TYPES_MODULE_DIRECTORY);
    await mkdir(typesDir, { recursive: true });

    for (const moduleExport of modules) {
        await rename(path.join(sourceTypesDir, moduleExport.filename), path.join(typesDir, moduleExport.filename));
    }

    await writeFile(path.join(typesDir, "mod.rs"), buildPartitionTypesModRs(modules));
    await writeFile(path.join(srcDir, "lib.rs"), buildTypesCrateLibRs({ hasTypes: modules.length > 0 }));
    // Each crate needs its own copy of the BuildError module and the serde
    // helpers that `#[serde(with = "crate::core::...")]` attributes resolve to.
    await copyBuildErrorModule({ monolithSrcDir, srcDir });
    await copyCoreModules(crateDir);
    await writeFile(
        path.join(srcDir, "prelude.rs"),
        buildTypesCratePrelude({
            hasErrorModule: true,
            // Bare references to shared types resolve through the prelude, so
            // core's types must be in scope in every leaf.
            reexportTypesFromCrate: dependsOnCoreCrate == null ? undefined : toSnakeCase(dependsOnCoreCrate)
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
    partitionCrateNames: string[];
}): Promise<void> {
    const { typesOutputDir, typesCrateName, partitionCrateNames } = args;
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
    for (const crateName of partitionCrateNames) {
        libLines.push(`pub use ${toSnakeCase(crateName)}::*;`);
    }
    libLines.push("");
    await writeFile(path.join(srcDir, "lib.rs"), libLines.join("\n"));

    await writeFile(
        path.join(typesOutputDir, "Cargo.toml"),
        buildTypesCrateCargoToml({
            crateName: toSnakeCase(typesCrateName),
            needsReqwest: false,
            includeSerdeDependencies: false,
            pathDependencies: partitionCrateNames.map((crateName) => ({
                crateName: toSnakeCase(crateName),
                path: `../${crateName}`
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
 * Crate names are derived from partition keys, which are fern filepaths and so
 * admit characters a crate name cannot contain. Sanitising can map two
 * distinct keys onto one name, and a subpackage named `core` collides with the
 * shared crate; both are disambiguated with a numeric suffix rather than
 * silently overwriting the other crate's directory.
 */
function resolveCrateNames({
    typesCrateName,
    partitionKeys
}: {
    typesCrateName: string;
    partitionKeys: string[];
}): Map<string, string> {
    const orderedKeys = partitionKeys.filter((key) => key !== CORE_PARTITION_KEY).sort((a, b) => a.localeCompare(b));
    if (partitionKeys.includes(CORE_PARTITION_KEY)) {
        orderedKeys.unshift(CORE_PARTITION_KEY);
    }

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

function toCrateNameSegment(partitionKey: string): string {
    return partitionKey
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

function toSnakeCase(crateName: string): string {
    return crateName.replace(/-/g, "_");
}
