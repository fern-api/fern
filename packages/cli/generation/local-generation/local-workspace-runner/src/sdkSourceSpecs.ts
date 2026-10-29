import path from "node:path";
import type { OpenAPISpec, ProtobufSpec, RawSpecsManifestEntry, Spec } from "@fern-api/api-workspace-commons";
import { toPosixPath } from "@fern-api/fs-utils";
import type { ConvertedProtobufSpec } from "@fern-api/lazy-fern-workspace";
import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

/** One source SDK Config generation uploads, traced back to the spec it came from. */
export interface SdkSourceSpec {
    spec: Spec;
    /** Index of the originating spec in the definition-ordered input (sdk-config.yml `source.specs`). */
    sourceIndex: number;
    /** Set when `spec` is OpenAPI converted from a from-openapi protobuf spec. */
    protobuf?: {
        /** The converted .proto file, relative to the proto root. */
        relativeFilePath: string;
        /** How many files the protobuf spec converted to: 1 with a target, else one per .proto under the root. */
        fileCount: number;
    };
}

export type ConvertProtobufSpecs = (specs: ProtobufSpec[]) => Promise<ConvertedProtobufSpec[]>;

/**
 * Turns definition-ordered specs into the sources SDK Config generation uploads. sdk-gen-core only
 * reads OpenAPI, so each from-openapi protobuf spec is replaced by the OpenAPI converted from it (its
 * overrides stay attached, to be forwarded). Docs-only protobuf specs are dropped with a warning, as
 * Fern leaves them out of SDKs. Every other spec passes through unchanged.
 */
export async function prepareSdkSourceSpecs({
    specs,
    convert,
    logger
}: {
    specs: Spec[];
    convert: ConvertProtobufSpecs;
    logger: { warn: (message: string) => void };
}): Promise<SdkSourceSpec[]> {
    const fromOpenAPI = specs.filter((spec): spec is ProtobufSpec => spec.type === "protobuf" && spec.fromOpenAPI);
    const converted = fromOpenAPI.length === 0 ? [] : await convert(fromOpenAPI);

    const prepared: SdkSourceSpec[] = [];
    let docsOnlyCount = 0;
    for (const [sourceIndex, spec] of specs.entries()) {
        if (spec.type !== "protobuf") {
            prepared.push({ spec, sourceIndex });
            continue;
        }
        if (!spec.fromOpenAPI) {
            docsOnlyCount++;
            logger.warn(
                `proto spec ${spec.absoluteFilepathToProtobufTarget ?? spec.absoluteFilepathToProtobufRoot} is docs-only (from-openapi is false); set from-openapi: true to include it in the SDK.`
            );
            continue;
        }
        const openApiSpecs = converted.find((result) => result.protobufSpec === spec)?.openApiSpecs;
        if (openApiSpecs == null) {
            throw new Error(`Protobuf spec ${spec.absoluteFilepathToProtobufRoot} was not converted to OpenAPI`);
        }
        for (const openApiSpec of openApiSpecs) {
            prepared.push({
                spec: openApiSpec,
                sourceIndex,
                protobuf: {
                    relativeFilePath: getRelativeProtobufFile(openApiSpec, spec),
                    fileCount: openApiSpecs.length
                }
            });
        }
    }

    if (prepared.length === 0 && docsOnlyCount > 0) {
        throw new CliError({
            message:
                "SDK generation has no sources: every protobuf spec is docs-only (from-openapi is false). Set from-openapi: true on a proto spec to include it in the SDK.",
            code: CliError.Code.ConfigError
        });
    }
    return prepared;
}

function getRelativeProtobufFile(openApiSpec: OpenAPISpec, protobufSpec: ProtobufSpec): string {
    if (openApiSpec.source.type !== "protobuf") {
        throw new Error(`OpenAPI converted from ${protobufSpec.absoluteFilepathToProtobufRoot} has no protobuf source`);
    }
    return toPosixPath(path.relative(openApiSpec.source.root, openApiSpec.source.file));
}

/**
 * Rewrites a customer's SDK Config `source.specs` so they line up, by position, with the uploaded
 * manifest entries, which sdk-gen-api requires. Plain specs are kept as written. A converted proto
 * becomes one plain OpenAPI spec per converted file: a proto without a target converts to several,
 * and a docs-only proto (absent from `sources`) is dropped. Converted files keep the proto's id
 * (`<id>:<proto file>` when there are several), name and import settings. The proto's namespace is
 * dropped because Fern does not apply namespaces to protobuf sources.
 */
export function rewriteSdkConfigSourceSpecs({
    configuredSpecs,
    sources,
    manifestEntries
}: {
    configuredSpecs: SdkConfigV1SourceSpec[];
    sources: SdkSourceSpec[];
    manifestEntries: RawSpecsManifestEntry[];
}): SdkConfigV1SourceSpec[] {
    if (sources.length !== manifestEntries.length) {
        throw new Error(
            `Cannot correlate SDK Config sources: ${sources.length} SDK sources but ${manifestEntries.length} manifest entries`
        );
    }
    const specs = sources.map((source, position) => {
        const configured = configuredSpecs[source.sourceIndex];
        if (configured == null) {
            throw new Error(`SDK Config does not contain source spec ${source.sourceIndex}`);
        }
        const entry = manifestEntries[position];
        if (source.protobuf == null || entry == null) {
            return { spec: configured, generatedId: false };
        }
        const multiFile = source.protobuf.fileCount > 1;
        const spec: SdkConfigV1SourceSpec = {
            id: multiFile ? `${configured.id}:${source.protobuf.relativeFilePath}` : configured.id,
            type: "openapi",
            // sdk-gen-api correlates by position and ignores this path; it names the uploaded artifact.
            path: entry.specPath.replace(/^\/+/, ""),
            ...(configured.name == null ? {} : { name: configured.name }),
            ...(configured.apiImportSettings == null ? {} : { apiImportSettings: configured.apiImportSettings })
        };
        return { spec, generatedId: multiFile };
    });
    return withUniqueIds(specs);
}

/** Suffixes generated ids that collide with another id; ids the customer wrote (already unique) win. */
function withUniqueIds(specs: Array<{ spec: SdkConfigV1SourceSpec; generatedId: boolean }>): SdkConfigV1SourceSpec[] {
    const usedIds = new Set(specs.filter(({ generatedId }) => !generatedId).map(({ spec }) => spec.id));
    return specs.map(({ spec, generatedId }) => {
        if (!generatedId) {
            return spec;
        }
        let id = spec.id;
        for (let suffix = 2; usedIds.has(id); suffix++) {
            id = `${spec.id}-${suffix}`;
        }
        usedIds.add(id);
        return { ...spec, id };
    });
}
