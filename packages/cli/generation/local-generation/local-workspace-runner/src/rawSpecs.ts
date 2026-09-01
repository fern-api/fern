import { isDeepStrictEqual } from "node:util";
import {
    type GraphQLSpec,
    getOpenAPISettings,
    type OpenAPISettings,
    type OpenAPISpec,
    type OpenRPCSpec,
    type ProtobufSpec,
    type RawSpecImportSettings,
    type RawSpecsManifest,
    type RawSpecsManifestEntry,
    Spec
} from "@fern-api/api-workspace-commons";
import { type Audiences } from "@fern-api/configuration";
import { assertNever, mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadAsyncAPI, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { copyFile, cp, mkdir, readdir, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import * as tar from "tar";
import tmp from "tmp-promise";

import { SPECS_MANIFEST_FILENAME } from "./constants.js";

export type { RawSpecsManifest, RawSpecsManifestEntry } from "@fern-api/api-workspace-commons";

/**
 * Pre-processes API specs by bundling external $refs, applying overrides and overlays, and writing
 * each resolved spec as compact JSON.
 *
 * Protobuf and GraphQL specs are copied as-is since they cannot be
 * meaningfully bundled.
 *
 * Returns a manifest describing the container paths for each spec.
 */
export async function collectRawSpecs({
    specs,
    hostOutputDir,
    containerBaseDir,
    context,
    audiences
}: {
    specs: Spec[];
    hostOutputDir: AbsoluteFilePath;
    containerBaseDir: string;
    context: TaskContext;
    audiences?: Audiences;
}): Promise<RawSpecsManifest> {
    const manifest: RawSpecsManifest = { specs: [] };
    if (specs.length === 0) {
        return manifest;
    }

    const typeCounters: Record<string, number> = {};
    function nextIndex(type: string): number {
        const idx = typeCounters[type] ?? 0;
        typeCounters[type] = idx + 1;
        return idx;
    }

    for (const spec of specs) {
        let specType: string;
        if (spec.type === "openapi") {
            specType = (await isAsyncAPISpec(spec.absoluteFilepath)) ? "asyncapi" : "openapi";
        } else {
            specType = spec.type;
        }
        const entry = await resolveAndWriteSpec({
            spec,
            hostOutputDir,
            containerBaseDir,
            context,
            index: nextIndex(specType),
            audiences
        });
        manifest.specs.push(entry);
    }

    context.logger.debug(`Resolved ${manifest.specs.length} spec(s) to ${hostOutputDir}`);
    return manifest;
}

async function resolveAndWriteSpec({
    spec,
    hostOutputDir,
    containerBaseDir,
    context,
    index,
    audiences
}: {
    spec: Spec;
    hostOutputDir: string;
    containerBaseDir: string;
    context: TaskContext;
    index: number;
    audiences?: Audiences;
}): Promise<RawSpecsManifestEntry> {
    switch (spec.type) {
        case "openapi":
            return resolveOpenAPIOrAsyncAPI({
                spec,
                hostOutputDir,
                containerBaseDir,
                context,
                index,
                audiences
            });
        case "openrpc":
            return resolveOpenRPC({ spec, hostOutputDir, containerBaseDir, context, index });
        case "protobuf":
            return copyProtobuf({ spec, hostOutputDir, containerBaseDir, index });
        case "graphql":
            return copyGraphQL({ spec, hostOutputDir, containerBaseDir, index });
        default:
            assertNever(spec);
    }
}

/**
 * Bundles an OpenAPI or AsyncAPI spec: resolves all external $refs, merges
 * overrides, applies overlays, and writes the result as compact JSON.
 */
async function resolveOpenAPIOrAsyncAPI({
    spec,
    hostOutputDir,
    containerBaseDir,
    context,
    index,
    audiences
}: {
    spec: OpenAPISpec;
    hostOutputDir: string;
    containerBaseDir: string;
    context: TaskContext;
    index: number;
    audiences?: Audiences;
}): Promise<RawSpecsManifestEntry> {
    const isAsync = await isAsyncAPISpec(spec.absoluteFilepath);
    const filename = isAsync ? `asyncapi${index}.json` : `openapi${index}.json`;

    let resolved: object;
    if (isAsync) {
        resolved = await loadAsyncAPI({
            context,
            absoluteFilePath: spec.absoluteFilepath,
            absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
        });
    } else {
        resolved = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: spec.absoluteFilepath,
            absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides,
            absolutePathToOpenAPIOverlays: spec.absoluteFilepathToOverlays
        });
    }

    resolved = filterSpec(resolved as Record<string, unknown>, audiences);

    await writeFile(path.join(hostOutputDir, filename), JSON.stringify(resolved));
    context.logger.debug(`Resolved ${isAsync ? "AsyncAPI" : "OpenAPI"} spec ${spec.absoluteFilepath} -> ${filename}`);
    return {
        type: isAsync ? "asyncapi" : "openapi",
        specPath: toContainerPath(filename, containerBaseDir),
        namespace: spec.namespace,
        apiImportSettings: mapApiImportSettings(getOpenAPISettings({ overrides: spec.settings }))
    };
}

type ApiImportSettingMapper = (settings: OpenAPISettings) => RawSpecImportSettings;

const SDK_CONFIG_IMPORT_SETTING_MAPPERS = {
    respectNullableSchemas: (settings) => ({ respectNullableSchemas: settings.respectNullableSchemas }),
    useTitlesAsName: (settings) => ({ titleAsSchemaName: settings.useTitlesAsName }),
    coerceEnumsToLiterals: (settings) => ({ coerceEnumsToLiterals: settings.coerceEnumsToLiterals }),
    shouldUseIdiomaticRequestNames: (settings) => ({
        idiomaticRequestNames: settings.shouldUseIdiomaticRequestNames
    }),
    wrapReferencesToNullableInOptional: (settings) => ({
        wrapReferencesToNullableInOptional: settings.wrapReferencesToNullableInOptional
    }),
    coerceOptionalSchemasToNullable: (settings) => ({
        coerceOptionalSchemasToNullable: settings.coerceOptionalSchemasToNullable
    }),
    pathParameterOrder: (settings) => ({ pathParameterOrder: settings.pathParameterOrder }),
    onlyIncludeReferencedSchemas: (settings) => ({
        onlyIncludeReferencedSchemas: settings.onlyIncludeReferencedSchemas
    }),
    objectQueryParameters: (settings) => ({ objectQueryParameters: settings.objectQueryParameters }),
    typeDatesAsStrings: (settings) => ({ typeDatesAsStrings: settings.typeDatesAsStrings }),
    groupMultiApiEnvironments: (settings) => ({
        groupMultiApiEnvironments: settings.groupMultiApiEnvironments
    }),
    defaultIntegerFormat: (settings) => ({ defaultIntegerFormat: settings.defaultIntegerFormat })
} satisfies Partial<Record<keyof OpenAPISettings, ApiImportSettingMapper>>;

function mapApiImportSettings(settings: OpenAPISettings): RawSpecImportSettings {
    const mappedSettings: RawSpecImportSettings = {};
    for (const mapSetting of Object.values(SDK_CONFIG_IMPORT_SETTING_MAPPERS)) {
        Object.assign(mappedSettings, mapSetting(settings));
    }
    return mappedSettings;
}

/**
 * Resolves an OpenRPC spec by reading, parsing, and merging overrides.
 * Writes the result as compact JSON.
 */
async function resolveOpenRPC({
    spec,
    hostOutputDir,
    containerBaseDir,
    context,
    index
}: {
    spec: OpenRPCSpec;
    hostOutputDir: string;
    containerBaseDir: string;
    context: TaskContext;
    index: number;
}): Promise<RawSpecsManifestEntry> {
    const filename = `openrpc${index}.json`;
    const rawContent = await readFile(spec.absoluteFilepath, "utf-8");

    let parsed: object;
    try {
        parsed = JSON.parse(rawContent);
    } catch {
        parsed = yaml.load(rawContent) as object;
    }

    let result = parsed;
    const overrides = normalizeOverrides(spec.absoluteFilepathToOverrides);
    for (const overridePath of overrides) {
        const overrideContent = await readFile(overridePath, "utf-8");
        let overrideParsed: object;
        try {
            overrideParsed = JSON.parse(overrideContent);
        } catch {
            overrideParsed = yaml.load(overrideContent) as object;
        }
        result = coreMergeWithOverrides({
            data: result as Record<string, unknown>,
            overrides: overrideParsed
        });
    }

    await writeFile(path.join(hostOutputDir, filename), JSON.stringify(result));
    context.logger.debug(`Resolved OpenRPC spec ${spec.absoluteFilepath} -> ${filename}`);

    return {
        type: "openrpc",
        specPath: toContainerPath(filename, containerBaseDir),
        namespace: spec.namespace
    };
}

/**
 * Copies a protobuf root directory and any override files that cannot be
 * pre-merged (they apply to the OpenAPI generated from protobuf, not to the
 * .proto files themselves).
 */
async function copyProtobuf({
    spec,
    hostOutputDir,
    containerBaseDir,
    index
}: {
    spec: ProtobufSpec;
    hostOutputDir: string;
    containerBaseDir: string;
    index: number;
}): Promise<RawSpecsManifestEntry> {
    const dirName = `protobuf${index}`;
    const destDir = path.join(hostOutputDir, dirName);
    await cp(spec.absoluteFilepathToProtobufRoot, destDir, { recursive: true });

    const entry: RawSpecsManifestEntry = {
        type: "protobuf",
        specPath: toContainerPath(dirName, containerBaseDir)
    };

    const overrides = normalizeOverrides(spec.absoluteFilepathToOverrides);
    if (overrides.length > 0) {
        entry.overridePaths = [];
        for (const [i, override] of overrides.entries()) {
            const overrideName = `protobuf${index}-override-${i}${path.extname(override)}`;
            await copyFile(override, path.join(hostOutputDir, overrideName));
            entry.overridePaths.push(toContainerPath(overrideName, containerBaseDir));
        }
    }

    return entry;
}

/**
 * Copies a GraphQL schema file and any override files. GraphQL SDL cannot be
 * meaningfully merged with JSON/YAML overrides.
 */
async function copyGraphQL({
    spec,
    hostOutputDir,
    containerBaseDir,
    index
}: {
    spec: GraphQLSpec;
    hostOutputDir: string;
    containerBaseDir: string;
    index: number;
}): Promise<RawSpecsManifestEntry> {
    const ext = path.extname(spec.absoluteFilepath) || ".graphql";
    const filename = `graphql${index}${ext}`;
    await copyFile(spec.absoluteFilepath, path.join(hostOutputDir, filename));

    const entry: RawSpecsManifestEntry = {
        type: "graphql",
        specPath: toContainerPath(filename, containerBaseDir),
        namespace: spec.namespace
    };

    const overrides = normalizeOverrides(spec.absoluteFilepathToOverrides);
    if (overrides.length > 0) {
        entry.overridePaths = [];
        for (const [i, override] of overrides.entries()) {
            const overrideName = `graphql${index}-override-${i}${path.extname(override)}`;
            await copyFile(override, path.join(hostOutputDir, overrideName));
            entry.overridePaths.push(toContainerPath(overrideName, containerBaseDir));
        }
    }

    return entry;
}

async function isAsyncAPISpec(filepath: string): Promise<boolean> {
    try {
        const content = await readFile(filepath, "utf-8");
        return content.includes("asyncapi");
    } catch {
        return false;
    }
}

function normalizeOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined): string[] {
    if (overrides == null) {
        return [];
    }
    return Array.isArray(overrides) ? overrides : [overrides];
}

function toContainerPath(relativePath: string, containerBaseDir: string): string {
    return path.posix.join(containerBaseDir, relativePath.split(path.sep).join(path.posix.sep));
}

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);

/**
 * Filters a resolved OpenAPI/AsyncAPI spec by removing operations marked with
 * `x-fern-ignore: true` and operations whose `x-fern-audiences` do not overlap
 * with the configured audiences. Operations without `x-fern-audiences` are kept
 * regardless of audience configuration (they are not restricted).
 *
 * Paths with no remaining operations after filtering are removed entirely.
 */
export function filterSpec(spec: Record<string, unknown>, audiences?: Audiences): Record<string, unknown> {
    if (audiences == null || audiences.type === "all") {
        return filterIgnoredOperations(spec);
    }

    const selectedAudiences = new Set(audiences.audiences);
    return filterOperations(spec, selectedAudiences);
}

function filterIgnoredOperations(spec: Record<string, unknown>): Record<string, unknown> {
    const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
    if (paths == null) {
        return spec;
    }

    const filteredPaths: Record<string, Record<string, unknown>> = {};
    for (const [pathKey, pathItem] of Object.entries(paths)) {
        if (pathItem == null || typeof pathItem !== "object") {
            continue;
        }
        const filteredPathItem: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(pathItem)) {
            if (HTTP_METHODS.has(key.toLowerCase()) && isIgnored(value)) {
                continue;
            }
            filteredPathItem[key] = value;
        }
        if (hasOperations(filteredPathItem)) {
            filteredPaths[pathKey] = filteredPathItem;
        }
    }

    return { ...spec, paths: filteredPaths };
}

function filterOperations(spec: Record<string, unknown>, selectedAudiences: Set<string>): Record<string, unknown> {
    const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
    if (paths == null) {
        return spec;
    }

    const filteredPaths: Record<string, Record<string, unknown>> = {};
    for (const [pathKey, pathItem] of Object.entries(paths)) {
        if (pathItem == null || typeof pathItem !== "object") {
            continue;
        }
        const filteredPathItem: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(key.toLowerCase())) {
                filteredPathItem[key] = value;
                continue;
            }
            if (isIgnored(value)) {
                continue;
            }
            if (!matchesAudiences(value, selectedAudiences)) {
                continue;
            }
            filteredPathItem[key] = value;
        }
        if (hasOperations(filteredPathItem)) {
            filteredPaths[pathKey] = filteredPathItem;
        }
    }

    return { ...spec, paths: filteredPaths };
}

function isIgnored(operation: unknown): boolean {
    if (operation == null || typeof operation !== "object") {
        return false;
    }
    const op = operation as Record<string, unknown>;
    return op["x-fern-ignore"] === true;
}

function matchesAudiences(operation: unknown, selectedAudiences: Set<string>): boolean {
    if (operation == null || typeof operation !== "object") {
        return true;
    }
    const op = operation as Record<string, unknown>;
    const opAudiences = op["x-fern-audiences"];
    if (opAudiences == null) {
        return true;
    }
    if (!Array.isArray(opAudiences)) {
        return typeof opAudiences === "string" && selectedAudiences.has(opAudiences);
    }
    return opAudiences.some((a) => typeof a === "string" && selectedAudiences.has(a));
}

function hasOperations(pathItem: Record<string, unknown>): boolean {
    return Object.keys(pathItem).some((key) => HTTP_METHODS.has(key.toLowerCase()));
}

/**
 * Collects raw API specs, writes them to a temporary directory alongside a
 * manifest, and packages everything into a gzipped tar archive suitable for
 * remote generation backends.
 */
export async function createSpecsTarGzBuffer({
    specs,
    context,
    audiences
}: {
    specs: Spec[];
    context: TaskContext;
    audiences?: Audiences;
}): Promise<Buffer> {
    return (
        await createSpecsTarGzArchive({
            specs,
            context,
            audiences
        })
    ).buffer;
}

export interface SpecsTarGzArchive {
    buffer: Buffer;
    manifest: RawSpecsManifest;
}

export interface SpecsTarGzGeneratorSelection {
    generatorIndex: number;
    specs: Spec[];
}

export interface GroupedSpecsTarGzArchive extends SpecsTarGzArchive {
    specIndexesByGeneratorIndex: Map<number, number[]>;
}

export interface SettledGroupedSpecsTarGzArchive {
    archive: GroupedSpecsTarGzArchive | undefined;
    errorsByGeneratorIndex: Map<number, unknown>;
}

interface DeduplicatedGeneratorSelections {
    uniqueSpecs: Spec[];
    uniqueSpecIndexesByGeneratorIndex: Map<number, number[]>;
    generatorIndexesByUniqueSpecIndex: Array<Set<number>>;
}

interface MaterializedSpec {
    directory: string;
    manifestEntry: RawSpecsManifestEntry;
}

/** Materializes each unique source once before aggregating only fully successful selections. */
export async function createGroupedSpecsTarGzArchiveSettled({
    generatorSelections,
    context,
    audiences
}: {
    generatorSelections: SpecsTarGzGeneratorSelection[];
    context: TaskContext;
    audiences?: Audiences;
}): Promise<SettledGroupedSpecsTarGzArchive> {
    const deduplicated = deduplicateGeneratorSelections(generatorSelections);
    const errorsByGeneratorIndex = new Map<number, unknown>();
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    try {
        const materializedRoot = path.join(tmpDir.path, "materialized");
        await mkdir(materializedRoot);
        const materializedSpecs = await Promise.allSettled(
            deduplicated.uniqueSpecs.map(async (spec, uniqueSpecIndex) => {
                const directory = path.join(materializedRoot, uniqueSpecIndex.toString());
                await mkdir(directory);
                const manifest = await collectRawSpecs({
                    specs: [spec],
                    hostOutputDir: AbsoluteFilePath.of(directory),
                    containerBaseDir: "/fern/specs",
                    context,
                    audiences
                });
                const manifestEntry = manifest.specs[0];
                if (manifestEntry == null) {
                    throw new Error(`Materialized source ${uniqueSpecIndex} did not produce a manifest entry`);
                }
                return { directory, manifestEntry };
            })
        );
        materializedSpecs.forEach((result, uniqueSpecIndex) => {
            if (result.status === "fulfilled") {
                return;
            }
            for (const generatorIndex of deduplicated.generatorIndexesByUniqueSpecIndex[uniqueSpecIndex] ?? []) {
                if (!errorsByGeneratorIndex.has(generatorIndex)) {
                    errorsByGeneratorIndex.set(generatorIndex, result.reason);
                }
            }
        });

        const successfulGeneratorIndexes = new Set(
            generatorSelections
                .map((selection) => selection.generatorIndex)
                .filter((generatorIndex) => !errorsByGeneratorIndex.has(generatorIndex))
        );
        if (successfulGeneratorIndexes.size === 0) {
            return { archive: undefined, errorsByGeneratorIndex };
        }

        try {
            const archive = await createArchiveFromMaterializedSpecs({
                materializedSpecs,
                deduplicated,
                successfulGeneratorIndexes,
                root: tmpDir.path
            });
            assertGeneratorSelectionOutcomes({ generatorSelections, archive, errorsByGeneratorIndex });
            return { archive, errorsByGeneratorIndex };
        } catch (error) {
            for (const generatorIndex of successfulGeneratorIndexes) {
                errorsByGeneratorIndex.set(generatorIndex, error);
            }
            return { archive: undefined, errorsByGeneratorIndex };
        }
    } finally {
        await tmpDir.cleanup();
    }
}

/** Builds one archive for explicit generator selections, deduplicating equivalent source entries. */
export async function createGroupedSpecsTarGzArchive({
    generatorSelections,
    context,
    audiences
}: {
    generatorSelections: SpecsTarGzGeneratorSelection[];
    context: TaskContext;
    audiences?: Audiences;
}): Promise<GroupedSpecsTarGzArchive> {
    const settled = await createGroupedSpecsTarGzArchiveSettled({ generatorSelections, context, audiences });
    // A shared materialization failure stores the same error object for every affected generator.
    const errors = [...new Set(settled.errorsByGeneratorIndex.values())];
    if (errors.length > 1) {
        throw new AggregateError(errors, "Grouped source archive preparation failed");
    }
    const error = errors[0];
    if (error != null) {
        throw error instanceof Error ? error : new Error("Grouped source archive preparation failed", { cause: error });
    }
    if (settled.archive == null) {
        throw new Error("Grouped source archive was not created");
    }
    return settled.archive;
}

function deduplicateGeneratorSelections(
    generatorSelections: SpecsTarGzGeneratorSelection[]
): DeduplicatedGeneratorSelections {
    const uniqueSpecs: Spec[] = [];
    const indexesBySpecKey = new Map<string, number>();
    const uniqueSpecIndexesByGeneratorIndex = new Map<number, number[]>();
    const generatorIndexesByUniqueSpecIndex: Array<Set<number>> = [];
    const orderedSelections = [...generatorSelections].sort(
        (left, right) => left.generatorIndex - right.generatorIndex
    );
    for (const selection of orderedSelections) {
        if (uniqueSpecIndexesByGeneratorIndex.has(selection.generatorIndex)) {
            throw new Error(`Duplicate source selection for generator index ${selection.generatorIndex}`);
        }
        const indexes = selection.specs.map((spec) => {
            const key = createSpecDeduplicationKey(spec);
            const existingIndex = indexesBySpecKey.get(key);
            if (existingIndex != null) {
                return existingIndex;
            }
            const index = uniqueSpecs.length;
            uniqueSpecs.push(spec);
            indexesBySpecKey.set(key, index);
            generatorIndexesByUniqueSpecIndex[index] = new Set();
            return index;
        });
        for (const index of new Set(indexes)) {
            generatorIndexesByUniqueSpecIndex[index]?.add(selection.generatorIndex);
        }
        uniqueSpecIndexesByGeneratorIndex.set(selection.generatorIndex, [...new Set(indexes)]);
    }
    return { uniqueSpecs, uniqueSpecIndexesByGeneratorIndex, generatorIndexesByUniqueSpecIndex };
}

async function createArchiveFromMaterializedSpecs({
    materializedSpecs,
    deduplicated,
    successfulGeneratorIndexes,
    root
}: {
    materializedSpecs: Array<PromiseSettledResult<MaterializedSpec>>;
    deduplicated: DeduplicatedGeneratorSelections;
    successfulGeneratorIndexes: Set<number>;
    root: string;
}): Promise<GroupedSpecsTarGzArchive> {
    const contentDirectory = path.join(root, "content");
    await mkdir(contentDirectory);
    const manifest: RawSpecsManifest = { specs: [] };
    const archiveSpecIndexByUniqueSpecIndex = new Map<number, number>();
    const typeCounters = new Map<RawSpecsManifestEntry["type"], number>();

    for (const [uniqueSpecIndex, generatorIndexes] of deduplicated.generatorIndexesByUniqueSpecIndex.entries()) {
        if (![...generatorIndexes].some((generatorIndex) => successfulGeneratorIndexes.has(generatorIndex))) {
            continue;
        }
        const materialized = materializedSpecs[uniqueSpecIndex];
        if (materialized?.status !== "fulfilled") {
            throw new Error(`Successful generator references source ${uniqueSpecIndex}, which was not materialized`);
        }
        const type = materialized.value.manifestEntry.type;
        const typeIndex = typeCounters.get(type) ?? 0;
        typeCounters.set(type, typeIndex + 1);
        const manifestEntry = await copyMaterializedSpec({
            materialized: materialized.value,
            contentDirectory,
            typeIndex
        });
        archiveSpecIndexByUniqueSpecIndex.set(uniqueSpecIndex, manifest.specs.length);
        manifest.specs.push(manifestEntry);
    }

    const specIndexesByGeneratorIndex = new Map<number, number[]>();
    for (const [generatorIndex, uniqueSpecIndexes] of deduplicated.uniqueSpecIndexesByGeneratorIndex) {
        if (!successfulGeneratorIndexes.has(generatorIndex)) {
            continue;
        }
        specIndexesByGeneratorIndex.set(
            generatorIndex,
            uniqueSpecIndexes.map((uniqueSpecIndex) => {
                const archiveSpecIndex = archiveSpecIndexByUniqueSpecIndex.get(uniqueSpecIndex);
                if (archiveSpecIndex == null) {
                    throw new Error(`Source ${uniqueSpecIndex} is unavailable for generator index ${generatorIndex}`);
                }
                return archiveSpecIndex;
            })
        );
    }

    const archive = await createArchiveFromDirectory({
        contentDirectory,
        tarGzPath: path.join(root, "specs.tar.gz"),
        manifest
    });
    return { ...archive, specIndexesByGeneratorIndex };
}

async function copyMaterializedSpec({
    materialized,
    contentDirectory,
    typeIndex
}: {
    materialized: MaterializedSpec;
    contentDirectory: string;
    typeIndex: number;
}): Promise<RawSpecsManifestEntry> {
    const sourcePrefix = `${materialized.manifestEntry.type}0`;
    const targetPrefix = `${materialized.manifestEntry.type}${typeIndex}`;
    assertSupportedMaterializedManifestEntry(materialized.manifestEntry);
    for (const entry of await readdir(materialized.directory, { withFileTypes: true })) {
        if (!hasSourcePrefix(entry.name) || (!entry.isFile() && !entry.isDirectory())) {
            throw new Error(`Unsupported materialized source entry: ${entry.name}`);
        }
        await cp(
            path.join(materialized.directory, entry.name),
            path.join(contentDirectory, replacePrefix(entry.name)),
            {
                recursive: entry.isDirectory()
            }
        );
    }

    return {
        ...materialized.manifestEntry,
        specPath: replaceContainerPathPrefix(materialized.manifestEntry.specPath),
        ...(materialized.manifestEntry.overridePaths == null
            ? {}
            : {
                  overridePaths: materialized.manifestEntry.overridePaths.map(replaceContainerPathPrefix)
              })
    };

    function replacePrefix(value: string): string {
        return `${targetPrefix}${value.slice(sourcePrefix.length)}`;
    }

    function hasSourcePrefix(value: string): boolean {
        // Each materialization directory contains exactly one source, which collectRawSpecs indexes as zero.
        return value === sourcePrefix || value.startsWith(`${sourcePrefix}.`) || value.startsWith(`${sourcePrefix}-`);
    }

    function replaceContainerPathPrefix(value: string): string {
        const basename = path.posix.basename(value);
        if (!hasSourcePrefix(basename)) {
            throw new Error(`Unexpected materialized source path: ${value}`);
        }
        return path.posix.join(path.posix.dirname(value), replacePrefix(basename));
    }
}

const SUPPORTED_MATERIALIZED_MANIFEST_ENTRY_KEYS = new Set<string>([
    "type",
    "specPath",
    "overridePaths",
    "namespace",
    "apiImportSettings"
] satisfies Array<keyof RawSpecsManifestEntry>);

function assertSupportedMaterializedManifestEntry(entry: RawSpecsManifestEntry): void {
    for (const key of Object.keys(entry)) {
        if (!SUPPORTED_MATERIALIZED_MANIFEST_ENTRY_KEYS.has(key)) {
            throw new Error(`Unsupported materialized manifest entry field: ${key}`);
        }
    }
}

function assertGeneratorSelectionOutcomes({
    generatorSelections,
    archive,
    errorsByGeneratorIndex
}: {
    generatorSelections: SpecsTarGzGeneratorSelection[];
    archive: GroupedSpecsTarGzArchive;
    errorsByGeneratorIndex: Map<number, unknown>;
}): void {
    for (const { generatorIndex } of generatorSelections) {
        const hasArchive = archive.specIndexesByGeneratorIndex.has(generatorIndex);
        const hasError = errorsByGeneratorIndex.has(generatorIndex);
        if (hasArchive === hasError) {
            throw new Error(
                `Generator index ${generatorIndex} must have exactly one source archive or materialization error outcome`
            );
        }
    }
}

const SDK_CONFIG_IMPORT_SETTING_KEYS = new Set(Object.keys(SDK_CONFIG_IMPORT_SETTING_MAPPERS));
const DEFAULT_OPENAPI_SETTINGS = getOpenAPISettings();

/** Rejects effective Fern import behavior that the downstream SDK Config contract cannot carry. */
export function validateSdkConfigImportSettings(specs: Spec[]): void {
    for (const spec of specs) {
        if (spec.type !== "openapi") {
            continue;
        }
        const settings = getOpenAPISettings({ overrides: spec.settings });
        for (const key of Object.getOwnPropertyNames(settings)) {
            const value = Reflect.get(settings, key);
            // Mapper membership means the setting's full value domain is preserved downstream.
            if (
                SDK_CONFIG_IMPORT_SETTING_KEYS.has(key) ||
                (key === "audiences" && Array.isArray(value) && value.length === 0) ||
                isDeepStrictEqual(value, Reflect.get(DEFAULT_OPENAPI_SETTINGS, key))
            ) {
                continue;
            }
            throw new Error(
                `SDK Config v1 cannot preserve effective OpenAPI import setting ${key}=${JSON.stringify(value)} for ${spec.absoluteFilepath}. Remove that setting or use a pre-cutover generator version until the shared SDK Config contract supports it.`
            );
        }
    }
}

export async function createSpecsTarGzArchive({
    specs,
    context,
    audiences
}: {
    specs: Spec[];
    context: TaskContext;
    audiences?: Audiences;
}): Promise<SpecsTarGzArchive> {
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    try {
        const contentDirectory = path.join(tmpDir.path, "content");
        await mkdir(contentDirectory);
        const manifest = await collectRawSpecs({
            specs,
            hostOutputDir: AbsoluteFilePath.of(contentDirectory),
            containerBaseDir: "/fern/specs",
            context,
            audiences
        });
        return await createArchiveFromDirectory({
            contentDirectory,
            tarGzPath: path.join(tmpDir.path, "specs.tar.gz"),
            manifest
        });
    } finally {
        await tmpDir.cleanup();
    }
}

async function createArchiveFromDirectory({
    contentDirectory,
    tarGzPath,
    manifest
}: {
    contentDirectory: string;
    tarGzPath: string;
    manifest: RawSpecsManifest;
}): Promise<SpecsTarGzArchive> {
    await writeFile(
        join(AbsoluteFilePath.of(contentDirectory), RelativeFilePath.of(SPECS_MANIFEST_FILENAME)),
        JSON.stringify(manifest, undefined, 4)
    );
    const archiveEntries = await listDeterministicArchiveEntries(contentDirectory);
    await tar.create(
        {
            gzip: true,
            cwd: contentDirectory,
            file: tarGzPath,
            portable: true,
            mtime: new Date(0),
            onWriteEntry: (entry) => {
                if (entry.stat != null) {
                    entry.stat.mode = 0o644;
                }
            }
        },
        archiveEntries
    );
    return { buffer: await readFile(tarGzPath), manifest };
}

async function listDeterministicArchiveEntries(root: string, relativeDirectory = ""): Promise<string[]> {
    const absoluteDirectory =
        relativeDirectory === "" ? root : path.join(root, ...relativeDirectory.split(path.posix.sep));
    const directoryEntries = await readdir(absoluteDirectory, { withFileTypes: true });
    const archiveEntries: string[] = [];
    for (const entry of directoryEntries.sort((left, right) => compareStrings(left.name, right.name))) {
        const relativePath = path.posix.join(relativeDirectory, entry.name);
        if (entry.isDirectory()) {
            archiveEntries.push(...(await listDeterministicArchiveEntries(root, relativePath)));
            continue;
        }
        if (!entry.isFile()) {
            throw new Error(`Unsupported generated source archive entry: ${relativePath}`);
        }
        archiveEntries.push(relativePath);
    }
    return archiveEntries;
}

function compareStrings(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
}

function createSpecDeduplicationKey(spec: Spec): string {
    // Every selection in one grouped archive shares the same audiences argument, so audience filtering
    // cannot differ between otherwise equivalent specs and does not need to be part of this key.
    switch (spec.type) {
        case "openapi":
            return stableStringify({
                type: spec.type,
                path: spec.absoluteFilepath,
                overrides: normalizeOverrides(spec.absoluteFilepathToOverrides),
                overlay: spec.absoluteFilepathToOverlays,
                namespace: spec.namespace,
                settings: getOpenAPISettings({ overrides: spec.settings })
            });
        case "openrpc":
            return stableStringify({
                type: spec.type,
                path: spec.absoluteFilepath,
                overrides: normalizeOverrides(spec.absoluteFilepathToOverrides),
                namespace: spec.namespace
            });
        case "protobuf":
            return stableStringify({
                type: spec.type,
                root: spec.absoluteFilepathToProtobufRoot,
                target: spec.absoluteFilepathToProtobufTarget,
                overrides: normalizeOverrides(spec.absoluteFilepathToOverrides),
                dependencies: spec.dependencies,
                settings: getOpenAPISettings({ overrides: spec.settings })
            });
        case "graphql":
            return stableStringify({
                type: spec.type,
                path: spec.absoluteFilepath,
                overrides: normalizeOverrides(spec.absoluteFilepathToOverrides),
                examples: spec.absoluteFilepathToExamples,
                namespace: spec.namespace
            });
        default:
            assertNever(spec);
    }
}

function stableStringify(value: unknown): string {
    return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortJsonValue);
    }
    if (value == null || typeof value !== "object") {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => compareStrings(left, right))
            .map(([key, child]) => [key, sortJsonValue(child)])
    );
}
