import { OnDiskNamedDefinitionFile, ParsedFernFile } from "@fern-api/api-workspace-commons";
import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { entries, validateAgainstJsonSchema } from "@fern-api/core-utils";
import {
    DefinitionFileSchema,
    PackageMarkerFileSchema,
    RawSchemas,
    RootApiFileSchema
} from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";

import * as RootApiFileJsonSchema from "../api-yml.schema.json";
import * as DefinitionFileJsonSchema from "../fern.schema.json";
import * as PackageMarkerFileJsonSchema from "../package-yml.schema.json";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result.js";

/** Cast a JSON schema import to the type expected by validateAgainstJsonSchema. */
function asJsonSchema(schema: Record<string, unknown>): Parameters<typeof validateAgainstJsonSchema>[1] {
    return schema as Parameters<typeof validateAgainstJsonSchema>[1];
}

/**
 * A cached parse result that tracks whether JSON schema validation was performed.
 * Entries cached via skipValidation are only returned to callers that also skip
 * validation, ensuring that callers requesting full validation always get it.
 */
interface CachedEntry<T> {
    value: T;
    validated: boolean;
}

/**
 * Module-level caches for validated/parsed file contents.
 * Keyed on the raw YAML string (file contents), these caches avoid redundant
 * JSON schema validation and schema parseOrThrow calls when the same file
 * is processed by multiple workspace instances (e.g., multiple generators
 * in a group, or multiple test runs against the same fixtures).
 */
const rootApiParsedCache = new Map<string, CachedEntry<RootApiFileSchema>>();
const definitionParsedCache = new Map<string, CachedEntry<DefinitionFileSchema>>();
const packageMarkerParsedCache = new Map<string, CachedEntry<PackageMarkerFileSchema>>();

export declare namespace validateStructureOfYamlFiles {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        rootApiFile: ParsedFernFile<RootApiFileSchema>;
        namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
        packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<
            RelativeFilePath,
            WorkspaceLoader.JsonSchemaValidationFailure | WorkspaceLoader.MissingFileFailure
        >;
    }
}

export function validateStructureOfYamlFiles({
    files,
    absolutePathToDefinition,
    skipValidation
}: {
    files: Record<RelativeFilePath, ParsedFernFile<unknown>>;
    absolutePathToDefinition: AbsoluteFilePath;
    /**
     * When true, skips JSON schema validation (validateAgainstJsonSchema).
     * Schema parsing (parseOrThrow) is still performed on cache miss to ensure
     * type-safe output. Use this when files are known to be valid (e.g., test
     * fixtures, or when re-generating IR for a second generator in the same group).
     */
    skipValidation?: boolean;
}): validateStructureOfYamlFiles.Return {
    let rootApiFile: ParsedFernFile<RootApiFileSchema> | undefined = undefined;
    const namesDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile> = {};
    const packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> = {};

    const failures: Record<
        RelativeFilePath,
        WorkspaceLoader.JsonSchemaValidationFailure | WorkspaceLoader.MissingFileFailure
    > = {};

    for (const [relativeFilepath, file] of entries(files)) {
        const parsedFileContents = file.contents;

        const addFailure = (error: validateAgainstJsonSchema.ValidationFailure) => {
            failures[relativeFilepath] = {
                type: WorkspaceLoaderFailureType.JSONSCHEMA_VALIDATION,
                error
            };
        };

        if (relativeFilepath === ROOT_API_FILENAME) {
            // Check cache: only use a cached entry if it was fully validated,
            // or if the caller is skipping validation anyway.
            const cached = rootApiParsedCache.get(file.rawContents);
            if (cached != null && (cached.validated || skipValidation)) {
                rootApiFile = {
                    defaultUrl: cached.value["default-url"],
                    contents: cached.value,
                    rawContents: file.rawContents
                };
            } else if (skipValidation) {
                // Skip JSON schema validation, just run parseOrThrow
                const contents = RawSchemas.serialization.RootApiFileSchema.parseOrThrow(parsedFileContents);
                rootApiParsedCache.set(file.rawContents, { value: contents, validated: false });
                rootApiFile = {
                    defaultUrl: contents["default-url"],
                    contents,
                    rawContents: file.rawContents
                };
            } else {
                const result = validateAgainstJsonSchema(parsedFileContents, asJsonSchema(RootApiFileJsonSchema));
                if (result.success) {
                    const contents = RawSchemas.serialization.RootApiFileSchema.parseOrThrow(parsedFileContents);
                    rootApiParsedCache.set(file.rawContents, { value: contents, validated: true });
                    rootApiFile = {
                        defaultUrl: contents["default-url"],
                        contents,
                        rawContents: file.rawContents
                    };
                } else {
                    addFailure(result);
                }
            }
        } else if (path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME) {
            // Check cache: only use a cached entry if it was fully validated,
            // or if the caller is skipping validation anyway.
            const cached = packageMarkerParsedCache.get(file.rawContents);
            if (cached != null && (cached.validated || skipValidation)) {
                packageMarkers[relativeFilepath] = {
                    defaultUrl: typeof cached.value.export === "object" ? cached.value.export.url : undefined,
                    contents: cached.value,
                    rawContents: file.rawContents
                };
            } else if (skipValidation) {
                const contents = RawSchemas.serialization.PackageMarkerFileSchema.parseOrThrow(parsedFileContents);
                packageMarkerParsedCache.set(file.rawContents, { value: contents, validated: false });
                packageMarkers[relativeFilepath] = {
                    defaultUrl: typeof contents.export === "object" ? contents.export.url : undefined,
                    contents,
                    rawContents: file.rawContents
                };
            } else {
                const result = validateAgainstJsonSchema(parsedFileContents, asJsonSchema(PackageMarkerFileJsonSchema));
                if (result.success) {
                    const contents = RawSchemas.serialization.PackageMarkerFileSchema.parseOrThrow(parsedFileContents);
                    packageMarkerParsedCache.set(file.rawContents, { value: contents, validated: true });
                    packageMarkers[relativeFilepath] = {
                        defaultUrl: typeof contents.export === "object" ? contents.export.url : undefined,
                        contents,
                        rawContents: file.rawContents
                    };
                } else {
                    addFailure(result);
                }
            }
        } else {
            // Check cache: only use a cached entry if it was fully validated,
            // or if the caller is skipping validation anyway.
            const cached = definitionParsedCache.get(file.rawContents);
            if (cached != null && (cached.validated || skipValidation)) {
                namesDefinitionFiles[relativeFilepath] = {
                    defaultUrl: undefined,
                    contents: cached.value,
                    rawContents: file.rawContents,
                    absoluteFilePath: join(absolutePathToDefinition, relativeFilepath)
                };
            } else if (skipValidation) {
                const contents = RawSchemas.serialization.DefinitionFileSchema.parseOrThrow(parsedFileContents);
                definitionParsedCache.set(file.rawContents, { value: contents, validated: false });
                namesDefinitionFiles[relativeFilepath] = {
                    defaultUrl: undefined,
                    contents,
                    rawContents: file.rawContents,
                    absoluteFilePath: join(absolutePathToDefinition, relativeFilepath)
                };
            } else {
                const result = validateAgainstJsonSchema(parsedFileContents, asJsonSchema(DefinitionFileJsonSchema));
                if (result.success) {
                    const contents = RawSchemas.serialization.DefinitionFileSchema.parseOrThrow(parsedFileContents);
                    definitionParsedCache.set(file.rawContents, { value: contents, validated: true });
                    namesDefinitionFiles[relativeFilepath] = {
                        defaultUrl: undefined,
                        contents,
                        rawContents: file.rawContents,
                        absoluteFilePath: join(absolutePathToDefinition, relativeFilepath)
                    };
                } else {
                    addFailure(result);
                }
            }
        }
    }

    if (rootApiFile == null) {
        return {
            didSucceed: false,
            failures: {
                [RelativeFilePath.of(ROOT_API_FILENAME)]: {
                    type: WorkspaceLoaderFailureType.FILE_MISSING
                },
                ...failures
            }
        };
    }

    if (Object.keys(failures).length > 0) {
        return {
            didSucceed: false,
            failures
        };
    } else {
        return {
            didSucceed: true,
            namedDefinitionFiles: namesDefinitionFiles,
            rootApiFile,
            packageMarkers
        };
    }
}
