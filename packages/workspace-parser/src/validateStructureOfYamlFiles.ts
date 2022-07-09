import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { RelativeFilePath } from "./types/RelativeFilePath";
import { WorkspaceParser, WorkspaceParserFailureType } from "./types/Result";

export declare namespace validateStructureOfYamlFiles {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        validatedFiles: Record<RelativeFilePath, FernConfigurationSchema>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceParser.StructureValidationFailure>;
    }
}

export function validateStructureOfYamlFiles(
    files: Record<RelativeFilePath, unknown>
): validateStructureOfYamlFiles.Return {
    const validatedFiles: Record<RelativeFilePath, FernConfigurationSchema> = {};
    const failures: Record<RelativeFilePath, WorkspaceParser.StructureValidationFailure> = {};

    for (const [relativeFilePath, parsedFileContents] of Object.entries(files)) {
        const parsed = FernConfigurationSchema.safeParse(parsedFileContents);
        if (parsed.success) {
            validatedFiles[relativeFilePath] = parsed.data;
        } else {
            failures[relativeFilePath] = {
                type: WorkspaceParserFailureType.STRUCTURE_VALIDATION,
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
