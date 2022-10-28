import { RelativeFilePath } from "@fern-api/fs-utils";
import yaml from "js-yaml";
import { FernFile } from "./types/FernFile";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";

export type ParsedFileContents = unknown;

export declare namespace Parser {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        files: Record<RelativeFilePath, ParsedFileContents>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.FileParseFailure>;
    }
}

export async function parseYamlFiles(files: readonly FernFile[]): Promise<Parser.Result> {
    const parsedFiles: Record<RelativeFilePath, ParsedFileContents> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.FileParseFailure> = {};

    function parseFilePath(file: FernFile) {
        try {
            const parsed = yaml.load(file.fileContents);
            parsedFiles[file.filepath] = parsed;
        } catch (error) {
            failures[file.filepath] = {
                type: WorkspaceLoaderFailureType.FILE_PARSE,
                error,
            };
        }
    }

    await Promise.all(files.map(parseFilePath));
    if (Object.keys(failures).length > 0) {
        return {
            didSucceed: false,
            failures,
        };
    } else {
        return {
            didSucceed: true,
            files: parsedFiles,
        };
    }
}
