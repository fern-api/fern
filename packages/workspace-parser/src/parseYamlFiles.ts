import yaml from "js-yaml";
import { FernFile } from "./types/FernFile";
import { RelativeFilePath } from "./types/RelativeFilePath";
import { WorkspaceParser, WorkspaceParserFailureType } from "./types/Result";

export type ParsedFileContents = unknown;

export declare namespace Parser {
    export type Result = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        files: Record<RelativeFilePath, ParsedFileContents>;
    }

    export interface FailedResult {
        didSucceed: false;
        failures: Record<RelativeFilePath, WorkspaceParser.FileParseFailure>;
    }
}

export async function parseYamlFiles(files: readonly FernFile[]): Promise<Parser.Result> {
    const parsedFiles: Record<RelativeFilePath, ParsedFileContents> = {};
    const failures: Record<RelativeFilePath, WorkspaceParser.FileParseFailure> = {};

    function parseFilePath(file: FernFile) {
        try {
            const parsed = yaml.load(file.fileContents);
            parsedFiles[file.filepath] = parsed;
        } catch (error) {
            failures[file.filepath] = {
                type: WorkspaceParserFailureType.FILE_PARSE,
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
