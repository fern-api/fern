import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME, ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { PackageMarkerFileSchema, RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import path from "path";
import { ZodError } from "zod";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";

export declare namespace validateStructureOfYamlFiles {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        rootApiFile: RootApiFileSchema;
        serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
        packageMarkers: Record<RelativeFilePath, PackageMarkerFileSchema>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<
            RelativeFilePath,
            WorkspaceLoader.StructureValidationFailure | WorkspaceLoader.MissingFileFailure
        >;
    }
}

export function validateStructureOfYamlFiles(
    files: Record<RelativeFilePath, unknown>
): validateStructureOfYamlFiles.Return {
    let rootApiFile: RootApiFileSchema | undefined = undefined;
    const serviceFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
    const packageMarkers: Record<RelativeFilePath, PackageMarkerFileSchema> = {};

    const failures: Record<
        RelativeFilePath,
        WorkspaceLoader.StructureValidationFailure | WorkspaceLoader.MissingFileFailure
    > = {};

    for (const [relativeFilepath, parsedFileContents] of entries(files)) {
        const addFailure = (error: ZodError) => {
            failures[relativeFilepath] = {
                type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION,
                error,
            };
        };

        if (relativeFilepath === ROOT_API_FILENAME) {
            const parsed = RootApiFileSchema.safeParse(parsedFileContents);
            if (parsed.success) {
                rootApiFile = parsed.data;
            } else {
                addFailure(parsed.error);
            }
        } else if (path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME) {
            const parsed = PackageMarkerFileSchema.safeParse(parsedFileContents);
            if (parsed.success) {
                packageMarkers[relativeFilepath] = parsed.data;
            } else {
                addFailure(parsed.error);
            }
        } else {
            const parsed = ServiceFileSchema.safeParse(parsedFileContents);
            if (parsed.success) {
                serviceFiles[relativeFilepath] = parsed.data;
            } else {
                addFailure(parsed.error);
            }
        }
    }

    if (rootApiFile == null) {
        return {
            didSucceed: false,
            failures: {
                [ROOT_API_FILENAME]: {
                    type: WorkspaceLoaderFailureType.FILE_MISSING,
                },
                ...failures,
            },
        };
    }

    if (Object.keys(failures).length > 0) {
        return {
            didSucceed: false,
            failures,
        };
    } else {
        return {
            didSucceed: true,
            serviceFiles,
            rootApiFile,
            packageMarkers,
        };
    }
}
