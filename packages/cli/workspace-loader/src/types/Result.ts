import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { ZodError } from "zod";
import { Workspace } from "./Workspace";

export declare namespace WorkspaceLoader {
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
        type: WorkspaceLoaderFailureType.FILE_READ;
        error: unknown;
    }

    export interface FileParseFailure {
        type: WorkspaceLoaderFailureType.FILE_PARSE;
        error: unknown;
    }

    export interface StructureValidationFailure {
        type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION;
        error: ZodError<ServiceFileSchema>;
    }
}

export enum WorkspaceLoaderFailureType {
    FILE_READ = "FILE_READ",
    FILE_PARSE = "FILE_PARSE",
    STRUCTURE_VALIDATION = "STRUCTURE_VALIDATION",
}
