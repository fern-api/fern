import { RelativeFilePath } from "@fern-api/core-utils";
import { Logger, LogLevel } from "@fern-api/logger";
import chalk from "chalk";

type Severity = "error" | "warning";

export declare namespace logIssueInYaml {
    export interface Args {
        severity: Severity;
        relativeFilePath: RelativeFilePath;
        breadcrumbs?: readonly (string | number)[];
        title: string;
        subtitle?: string;
        logger: Logger;
    }
}

export function logIssueInYaml({
    severity,
    relativeFilePath,
    breadcrumbs = [],
    title,
    subtitle,
    logger,
}: logIssueInYaml.Args): void {
    let str = title;
    if (subtitle != null) {
        str += "\n" + chalk.dim(subtitle);
    }
    str += "\n" + chalk.blue([relativeFilePath, ...breadcrumbs].join(" -> "));
    logger.log(str, getLogLevelForSeverity(severity));
}

function getLogLevelForSeverity(severity: Severity) {
    switch (severity) {
        case "error":
            return LogLevel.Error;
        case "warning":
            return LogLevel.Warn;
    }
}
