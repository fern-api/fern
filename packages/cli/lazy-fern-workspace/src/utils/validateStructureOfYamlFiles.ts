import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/configuration";
import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    RawSchemas,
    DefinitionFileSchema,
    PackageMarkerFileSchema,
    RootApiFileSchema
} from "@fern-api/fern-definition-schema";
import path from "path";
import { ZodError } from "zod";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result";
import { OnDiskNamedDefinitionFile, ParsedFernFile } from "@fern-api/api-workspace-commons";
import { ValidationError } from "@fern-fern/fiddle-sdk/core/schemas/Schema";

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
            WorkspaceLoader.StructureValidationFailure | WorkspaceLoader.MissingFileFailure
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
        WorkspaceLoader.StructureValidationFailure | WorkspaceLoader.MissingFileFailure
    > = {};

    for (const [relativeFilepath, file] of entries(files)) {
        const parsedFileContents = file.contents;

        const addFailure = (error: unknown) => {
            failures[relativeFilepath] = {
                type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION,
                error
            };
        };

        if (relativeFilepath === ROOT_API_FILENAME) {
            const maybeValidFileContents = RawSchemas.serialization.RootApiFileSchema.parse(parsedFileContents);
            if (maybeValidFileContents.ok) {
                rootApiFile = {
                    defaultUrl: maybeValidFileContents.value["default-url"],
                    contents: maybeValidFileContents.value,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(maybeValidFileContents.errors);
            }
        } else if (path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME) {
            const maybeValidFileContents = RawSchemas.serialization.PackageMarkerFileSchema.parse(parsedFileContents);
            if (maybeValidFileContents.ok) {
                packageMarkers[relativeFilepath] = {
                    defaultUrl:
                        typeof maybeValidFileContents.value.export === "object"
                            ? maybeValidFileContents.value.export.url
                            : undefined,
                    contents: maybeValidFileContents.value,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(maybeValidFileContents.errors);
            }
        } else {
            const maybeValidFileContents = RawSchemas.serialization.DefinitionFileSchema.parse(parsedFileContents);
            if (maybeValidFileContents.ok) {
                namesDefinitionFiles[relativeFilepath] = {
                    defaultUrl: undefined,
                    contents: maybeValidFileContents.value,
                    rawContents: file.rawContents,
                    absoluteFilePath: join(absolutePathToDefinition, relativeFilepath)
                };
            } else {
                addFailure(maybeValidFileContents.errors);
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
