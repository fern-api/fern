import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";

export declare namespace validateStructureOfYamlFiles {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        validatedFiles: Record<RelativeFilePath, ServiceFileSchema>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.StructureValidationFailure>;
    }
}

export function validateStructureOfYamlFiles(
    files: Record<RelativeFilePath, unknown>
): validateStructureOfYamlFiles.Return {
    const validatedFiles: Record<RelativeFilePath, ServiceFileSchema> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.StructureValidationFailure> = {};

    for (const [relativeFilepath, parsedFileContents] of entries(files)) {
        const parsed = ServiceFileSchema.safeParse(parsedFileContents);
        if (parsed.success) {
            validatedFiles[relativeFilepath] = parsed.data;
        } else {
            failures[relativeFilepath] = {
                type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION,
                error: parsed.error,
            };
        }
    }

    if (Object.keys(failures).length > 0) {
        return {
            didSucceed: false,
            failures,
        };
    } else {
        return {
            didSucceed: true,
            validatedFiles,
        };
    }
}
