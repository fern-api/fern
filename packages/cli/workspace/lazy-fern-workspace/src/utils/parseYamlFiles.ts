import yaml from "js-yaml";

import { FernFile, ParsedFernFile } from "@fern-api/api-workspace-commons";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./Result";

export declare namespace Parser {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        files: Record<RelativeFilePath, ParsedFernFile<unknown>>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceLoader.FileParseFailure>;
    }
}

export async function parseYamlFiles(files: readonly FernFile[]): Promise<Parser.Result> {
    const parsedFiles: Record<RelativeFilePath, ParsedFernFile<unknown>> = {};
    const failures: Record<RelativeFilePath, WorkspaceLoader.FileParseFailure> = {};

    function parseFilePath(file: FernFile) {
        try {
            parsedFiles[file.relativeFilepath] = {
                defaultUrl: undefined,
                contents: yaml.load(file.fileContents, {
                    schema: yaml.CORE_SCHEMA
                }),
                rawContents: file.fileContents
            };
        } catch (error) {
            failures[file.relativeFilepath] = {
                type: WorkspaceLoaderFailureType.FILE_PARSE,
                error
            };
        }
    }

    await Promise.all(files.map(parseFilePath));
    if (Object.keys(failures).length > 0) {
        return {
            didSucceed: false,
            failures
        };
    } else {
        return {
            didSucceed: true,
            files: parsedFiles
        };
    }
}
