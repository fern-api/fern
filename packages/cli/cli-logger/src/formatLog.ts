import chalk from "chalk";

export declare namespace formatLog {
    export interface Args {
        breadcrumbs?: readonly (string | number)[];
        title: string;
        subtitle?: string;
    }
}

export function formatLog({ breadcrumbs = [], title, subtitle }: formatLog.Args): string {
    const lines: string[] = [];
    if (breadcrumbs.length > 0) {
        lines.push(chalk.blue(breadcrumbs.join(" -> ")));
    }
    lines.push(title);
    if (subtitle != null) {
        lines.push(chalk.dim(subtitle));
    }
    return lines.join("\n");
}
