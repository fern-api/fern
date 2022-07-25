import { RelativeFilePath } from "@fern-api/config-management-commons";
import { assertNever, entries } from "@fern-api/core-utils";
import { WorkspaceParser, WorkspaceParserFailureType } from "@fern-api/workspace-parser";
import chalk from "chalk";
import { YAMLException } from "js-yaml";
import { ZodIssue, ZodIssueCode } from "zod";
import { logIssueInYaml } from "../../logger/logIssueInYaml";

export function handleFailedWorkspaceParserResult(result: WorkspaceParser.FailedResult): void {
    for (const [relativeFilePath, failure] of entries(result.failures)) {
        handleWorkspaceParserFailureForFile({ relativeFilePath, failure });
    }
}

function handleWorkspaceParserFailureForFile({
    relativeFilePath,
    failure,
}: {
    relativeFilePath: RelativeFilePath;
    failure: WorkspaceParser.Failure;
}): void {
    switch (failure.type) {
        case WorkspaceParserFailureType.FILE_READ:
            console.error("Failed to open file", relativeFilePath);
            break;
        case WorkspaceParserFailureType.FILE_PARSE:
            if (failure.error instanceof YAMLException) {
                logIssueInYaml({
                    severity: "error",
                    relativeFilePath,
                    title: `Failed to parse YAML: ${failure.error.reason}`,
                    subtitle: failure.error.mark.snippet,
                });
            } else {
                console.error("Failed to parse file", relativeFilePath);
            }
            break;
        case WorkspaceParserFailureType.STRUCTURE_VALIDATION:
            for (const issue of failure.error.issues) {
                for (const { title, subtitle } of parseIssue(issue)) {
                    logIssueInYaml({
                        severity: "error",
                        relativeFilePath,
                        breadcrumbs: issue.path,
                        title,
                        subtitle,
                    });
                }
            }
            break;
        default:
            assertNever(failure);
    }
}

interface ParsedIssue {
    title: string;
    subtitle?: string;
}

function parseIssue(issue: ZodIssue): ParsedIssue[] {
    switch (issue.code) {
        case ZodIssueCode.invalid_type:
            return [
                {
                    title: "Incorrect type",
                    subtitle: `Expected ${chalk.underline(issue.expected)} but received ${chalk.underline(
                        issue.received
                    )}`,
                },
            ];
        case ZodIssueCode.unrecognized_keys:
            return issue.keys.map((key) => ({
                title: "Unexpected key",
                subtitle: `Encountered unexpected key ${chalk.underline(key)}`,
            }));
        case ZodIssueCode.invalid_enum_value:
            return [
                {
                    title: "Unrecognized value",
                    subtitle: `Allowed values: ${issue.options.map((option) => chalk.underline(option)).join(", ")}`,
                },
            ];
        case ZodIssueCode.invalid_union:
        case ZodIssueCode.invalid_arguments:
        case ZodIssueCode.invalid_return_type:
        case ZodIssueCode.invalid_date:
        case ZodIssueCode.invalid_string:
        case ZodIssueCode.too_small:
        case ZodIssueCode.too_big:
        case ZodIssueCode.invalid_intersection_types:
        case ZodIssueCode.not_multiple_of:
        case ZodIssueCode.custom:
        default:
            return [{ title: issue.message }];
    }
}
