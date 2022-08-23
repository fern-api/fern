import chalk from "chalk";

export declare namespace formatLog {
    export interface Args {
        breadcrumbs?: readonly (string | number)[];
        title: string;
        subtitle?: string;
    }
}

export function formatLog({ breadcrumbs = [], title, subtitle }: formatLog.Args): string {
    let str = title;
    if (subtitle != null) {
        str += "\n" + chalk.dim(subtitle);
    }
    if (breadcrumbs.length > 0) {
        str += "\n" + chalk.blue(breadcrumbs.join(" -> "));
    }
    return str;
}
