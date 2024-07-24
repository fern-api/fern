import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/configuration";
import { entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import path from "path";
import { ZodError } from "zod";
import { ParsedFernFile } from "./types/FernFile";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { OnDiskNamedDefinitionFile } from "./types/Workspace";

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

        const addFailure = (error: ZodError) => {
            failures[relativeFilepath] = {
                type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION,
                error
            };
        };

        if (relativeFilepath === ROOT_API_FILENAME) {
            const maybeValidFileContents = RootApiFileSchema.safeParse(parsedFileContents);
            if (maybeValidFileContents.success) {
                rootApiFile = {
                    defaultUrl: maybeValidFileContents.data["default-url"],
                    contents: maybeValidFileContents.data,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(maybeValidFileContents.error);
            }
        } else if (path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME) {
            const maybeValidFileContents = PackageMarkerFileSchema.safeParse(parsedFileContents);
            if (maybeValidFileContents.success) {
                packageMarkers[relativeFilepath] = {
                    defaultUrl:
                        typeof maybeValidFileContents.data.export === "object"
                            ? maybeValidFileContents.data.export.url
                            : undefined,
                    contents: maybeValidFileContents.data,
                    rawContents: file.rawContents
                };
            } else {
                addFailure(maybeValidFileContents.error);
            }
        } else {
            const maybeValidFileContents = DefinitionFileSchema.safeParse(parsedFileContents);
            if (maybeValidFileContents.success) {
                namesDefinitionFiles[relativeFilepath] = {
                    defaultUrl: undefined,
                    contents: maybeValidFileContents.data,
                    rawContents: file.rawContents,
                    absoluteFilepath: join(absolutePathToDefinition, relativeFilepath)
                };
            } else {
                addFailure(maybeValidFileContents.error);
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
