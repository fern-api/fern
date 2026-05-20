import {
    type GraphQLSpec,
    type OpenAPISpec,
    type OpenRPCSpec,
    type ProtobufSpec,
    Spec
} from "@fern-api/api-workspace-commons";
import { type Audiences } from "@fern-api/configuration";
import { assertNever, mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { loadAsyncAPI, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { copyFile, cp, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import * as tar from "tar";
import tmp from "tmp-promise";

import { SPECS_MANIFEST_FILENAME } from "./constants.js";

export interface RawSpecsManifestEntry {
    type: "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";
    specPath: string;
    overridePaths?: string[];
}

export interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}

/**
 * Pre-processes API specs by bundling external $refs, merging overrides, and
 * applying overlays, then writes each resolved spec as compact JSON (no
 * whitespace). Schemas referenced from multiple external files are
 * deduplicated into a single `#/components/schemas/` entry by Redocly's
 * bundler.
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

    for (const [i, spec] of specs.entries()) {
        const entry = await resolveAndWriteSpec({
            spec,
            hostOutputDir,
            containerBaseDir,
            context,
            index: i,
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
            return resolveOpenAPIOrAsyncAPI({ spec, hostOutputDir, containerBaseDir, context, index, audiences });
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
    const filename = `spec-${index}.json`;

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
        specPath: toContainerPath(filename, containerBaseDir)
    };
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
    const filename = `spec-${index}.json`;
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
        specPath: toContainerPath(filename, containerBaseDir)
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
    const dirName = `proto-${index}`;
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
            const overrideName = `proto-${index}-override-${i}${path.extname(override)}`;
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
    const filename = `spec-${index}${ext}`;
    await copyFile(spec.absoluteFilepath, path.join(hostOutputDir, filename));

    const entry: RawSpecsManifestEntry = {
        type: "graphql",
        specPath: toContainerPath(filename, containerBaseDir)
    };

    const overrides = normalizeOverrides(spec.absoluteFilepathToOverrides);
    if (overrides.length > 0) {
        entry.overridePaths = [];
        for (const [i, override] of overrides.entries()) {
            const overrideName = `graphql-${index}-override-${i}${path.extname(override)}`;
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
 * uploading to Fiddle's `startJob` endpoint.
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
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    try {
        const manifest = await collectRawSpecs({
            specs,
            hostOutputDir: AbsoluteFilePath.of(tmpDir.path),
            containerBaseDir: "/fern/specs",
            context,
            audiences
        });

        await writeFile(
            join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of(SPECS_MANIFEST_FILENAME)),
            JSON.stringify(manifest, undefined, 4)
        );

        const tarGzPath = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("specs.tar.gz"));
        await tar.create(
            {
                gzip: true,
                cwd: tmpDir.path,
                file: tarGzPath,
                portable: true,
                filter: (entryPath: string) => entryPath !== "./specs.tar.gz"
            },
            ["."]
        );

        return await readFile(tarGzPath);
    } finally {
        await tmpDir.cleanup();
    }
}
