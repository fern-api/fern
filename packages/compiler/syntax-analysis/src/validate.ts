import { RelativeFilePath } from "@fern-api/compiler-commons";
import { FernConfigurationSchema } from "./schemas/FernConfigurationSchema";
import { SyntaxAnalysis, SyntaxAnalysisFailureType } from "./types";

export declare namespace Validator {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        validatedFiles: Record<RelativeFilePath, FernConfigurationSchema>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, SyntaxAnalysis.StructureValidationFailure>;
    }
}

export function validate(files: Record<RelativeFilePath, unknown>): Validator.Result {
    const validatedFiles: Record<RelativeFilePath, FernConfigurationSchema> = {};
    const failures: Record<RelativeFilePath, SyntaxAnalysis.StructureValidationFailure> = {};

    for (const [relativeFilePath, parsedFileContents] of Object.entries(files)) {
        const parsed = FernConfigurationSchema.safeParse(parsedFileContents);
        if (parsed.success) {
            validatedFiles[relativeFilePath] = parsed.data;
        } else {
            failures[relativeFilePath] = {
                type: SyntaxAnalysisFailureType.STRUCTURE_VALIDATION,
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
