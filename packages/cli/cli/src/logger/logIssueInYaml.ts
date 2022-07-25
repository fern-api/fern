import { RelativeFilePath } from "@fern-api/config-management-commons";
import chalk from "chalk";

type Severity = "error" | "warning";

export declare namespace logIssueInYaml {
    export interface Args {
        severity: Severity;
        relativeFilePath: RelativeFilePath;
        breadcrumbs?: readonly (string | number)[];
        title: string;
        subtitle?: string;
    }
}

export function logIssueInYaml({
    severity,
    relativeFilePath,
    breadcrumbs = [],
    title,
    subtitle,
}: logIssueInYaml.Args): void {
    console.group(chalk[getColorForSeverity(severity)](title));
    if (subtitle != null) {
        console.log(subtitle);
    }
    console.log(chalk.blue([relativeFilePath, ...breadcrumbs].join(" -> ")));
    console.log();
    console.groupEnd();
}

function getColorForSeverity(severity: Severity) {
    switch (severity) {
        case "error":
            return "red";
        case "warning":
            return "yellow";
    }
}
