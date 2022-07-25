import { RelativeFilePath } from "@fern-api/config-management-commons";
import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { ZodError } from "zod";
import { Workspace } from "./Workspace";

export declare namespace WorkspaceParser {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        workspace: Workspace;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, Failure>;
    }

    export type Failure = FileReadFilure | FileParseFailure | StructureValidationFailure;

    export interface FileReadFilure {
        type: WorkspaceParserFailureType.FILE_READ;
        error: unknown;
    }

    export interface FileParseFailure {
        type: WorkspaceParserFailureType.FILE_PARSE;
        error: unknown;
    }

    export interface StructureValidationFailure {
        type: WorkspaceParserFailureType.STRUCTURE_VALIDATION;
        error: ZodError<FernConfigurationSchema>;
    }
}

export enum WorkspaceParserFailureType {
    FILE_READ = "FILE_READ",
    FILE_PARSE = "FILE_PARSE",
    STRUCTURE_VALIDATION = "STRUCTURE_VALIDATION",
}
