import { RelativeFilePath } from "@fernapi/compiler-commons";
import { ZodError } from "zod";
import { FernSchema } from "./schemas/FernSchema";

export declare namespace SyntaxAnalysis {
    export interface SuccessfulResult {
        validatedFiles: Record<RelativeFilePath, FernSchema>;
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
        error: ZodError<FernSchema>;
    }
}

export enum SyntaxAnalysisFailureType {
    FILE_READ = "FILE_READ",
    FILE_PARSE = "FILE_PARSE",
    STRUCTURE_VALIDATION = "STRUCTURE_VALIDATION",
}
