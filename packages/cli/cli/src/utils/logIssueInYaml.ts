import { RelativeFilePath } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
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
    let str = "";
    str += chalk[getColorForSeverity(severity)](title);
    if (subtitle != null) {
        str += "\n" + chalk.dim(subtitle);
    }
    str += "\n" + chalk.blue([relativeFilePath, ...breadcrumbs].join(" -> "));
    logger.error(str);
}

function getColorForSeverity(severity: Severity) {
    switch (severity) {
        case "error":
            return "red";
        case "warning":
            return "yellow";
    }
}
