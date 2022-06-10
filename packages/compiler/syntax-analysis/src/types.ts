import { RelativeFilePath } from "@fern-api/compiler-commons";
import { ZodError } from "zod";
import { FernConfigurationSchema } from "./schemas";

export declare namespace SyntaxAnalysis {
    export interface SuccessfulResult {
        validatedFiles: Record<RelativeFilePath, FernConfigurationSchema>;
    }

    export interface FailedResult {
        failures: Record<RelativeFilePath, Failure>;
    }

    export type Failure = FileReadFilure | FileParseFailure | StructureValidationFailure;

    export interface FileReadFilure {
        type: SyntaxAnalysisFailureType.FILE_READ;
        error: unknown;
    }

    export interface FileParseFailure {
        type: SyntaxAnalysisFailureType.FILE_PARSE;
        error: unknown;
    }

    export interface StructureValidationFailure {
        type: SyntaxAnalysisFailureType.STRUCTURE_VALIDATION;
        error: ZodError<FernConfigurationSchema>;
    }
}

export enum SyntaxAnalysisFailureType {
    FILE_READ = "FILE_READ",
    FILE_PARSE = "FILE_PARSE",
    STRUCTURE_VALIDATION = "STRUCTURE_VALIDATION",
}
