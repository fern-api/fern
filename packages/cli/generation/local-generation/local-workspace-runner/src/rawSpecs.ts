import {
    type GraphQLSpec,
    type OpenAPISpec,
    type OpenRPCSpec,
    type ProtobufSpec,
    Spec
} from "@fern-api/api-workspace-commons";
import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadAsyncAPI, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { copyFile, cp, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

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
    context
}: {
    specs: Spec[];
    hostOutputDir: AbsoluteFilePath;
    containerBaseDir: string;
    context: TaskContext;
}): Promise<RawSpecsManifest> {
    const manifest: RawSpecsManifest = { specs: [] };
    if (specs.length === 0) {
        return manifest;
    }

    for (const [i, spec] of specs.entries()) {
        const entry = await resolveAndWriteSpec({ spec, hostOutputDir, containerBaseDir, context, index: i });
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
    index
}: {
    spec: Spec;
    hostOutputDir: string;
    containerBaseDir: string;
    context: TaskContext;
    index: number;
}): Promise<RawSpecsManifestEntry> {
    switch (spec.type) {
        case "openapi":
            return resolveOpenAPIOrAsyncAPI({ spec, hostOutputDir, containerBaseDir, context, index });
        case "openrpc":
            return resolveOpenRPC({ spec, hostOutputDir, containerBaseDir, context, index });
        case "protobuf":
            return copyProtobuf({ spec, hostOutputDir, containerBaseDir, index });
        case "graphql":
            return copyGraphQL({ spec, hostOutputDir, containerBaseDir, index });
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
    index
}: {
    spec: OpenAPISpec;
    hostOutputDir: string;
    containerBaseDir: string;
    context: TaskContext;
    index: number;
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
