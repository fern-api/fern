import { assertNever, entries, RelativeFilePath } from "@fern-api/core-utils";
import { formatLog, Logger } from "@fern-api/logger";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { YAMLException } from "js-yaml";
import { ZodIssue, ZodIssueCode } from "zod";

export function handleFailedWorkspaceParserResult(result: WorkspaceLoader.FailedResult, logger: Logger): void {
    for (const [relativeFilePath, failure] of entries(result.failures)) {
        handleWorkspaceParserFailureForFile({ relativeFilePath, failure, logger });
    }
}

function handleWorkspaceParserFailureForFile({
    relativeFilePath,
    failure,
    logger,
}: {
    relativeFilePath: RelativeFilePath;
    failure: WorkspaceLoader.Failure;
    logger: Logger;
}): void {
    switch (failure.type) {
        case WorkspaceLoaderFailureType.FILE_READ:
            logger.error("Failed to open file: " + relativeFilePath);
            break;
        case WorkspaceLoaderFailureType.FILE_PARSE:
            if (failure.error instanceof YAMLException) {
                logger.error(
                    formatLog({
                        title: `Failed to parse YAML: ${failure.error.reason}`,
                        subtitle: failure.error.mark.snippet,
                    })
                );
            } else {
                logger.error("Failed to parse file: " + relativeFilePath);
            }
            break;
        case WorkspaceLoaderFailureType.STRUCTURE_VALIDATION:
            for (const issue of failure.error.issues) {
                for (const { title, subtitle } of parseIssue(issue)) {
                    logger.error(
                        formatLog({
                            title,
                            subtitle,
                            breadcrumbs: issue.path,
                        })
                    );
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
