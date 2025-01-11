import path from "path";

import { OnDiskNamedDefinitionFile, ParsedFernFile } from "@fern-api/api-workspace-commons";
import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/configuration-loader";
import { entries, validateAgainstJsonSchema } from "@fern-api/core-utils";
import { PackageMarkerFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import * as RootApiFileJsonSchema from "../api-yml.schema.json";
import * as DefinitionFileJsonSchema from "../fern.schema.json";
import * as PackageMarkerFileJsonSchema from "../package-yml.schema.json";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result";

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
    absolutePathToDefinition
}: {
    files: Record<RelativeFilePath, ParsedFernFile<unknown>>;
    absolutePathToDefinition: AbsoluteFilePath;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = validateAgainstJsonSchema(parsedFileContents, RootApiFileJsonSchema as any);
            if (result.success) {
                const contents = RawSchemas.serialization.RootApiFileSchema.parseOrThrow(parsedFileContents);
                rootApiFile = {
                    defaultUrl: contents["default-url"],
                    contents,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(result);
            }
        } else if (path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = validateAgainstJsonSchema(parsedFileContents, PackageMarkerFileJsonSchema as any);
            if (result.success) {
                const contents = RawSchemas.serialization.PackageMarkerFileSchema.parseOrThrow(parsedFileContents);
                packageMarkers[relativeFilepath] = {
                    defaultUrl: typeof contents.export === "object" ? contents.export.url : undefined,
                    contents,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(result);
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = validateAgainstJsonSchema(parsedFileContents, DefinitionFileJsonSchema as any);
            if (result.success) {
                const contents = RawSchemas.serialization.DefinitionFileSchema.parseOrThrow(parsedFileContents);
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
