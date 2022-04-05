import chalk from "chalk";

export const SUCCESS_WRITER = chalk.green;
export const PRIMARY_WRITER = chalk.blue;
export const WARNING_WRITER = chalk.keyword("orange");
export const DANGER_WRITER = chalk.red;

export type IntentLoggerArgs = Omit<LogMessageArgs, "writer" | "title">;

export function logSuccess(args: IntentLoggerArgs): void {
    logMessage({
        ...args,
        writer: SUCCESS_WRITER,
    });
}

export function logError(args: IntentLoggerArgs): void {
    logMessage({
        ...args,
        writer: DANGER_WRITER,
    });
}

export function logWarning(args: IntentLoggerArgs): void {
    logMessage({
        ...args,
        writer: WARNING_WRITER,
    });
}

interface LogMessageArgs {
    packageName?: string;
    message: string;
    additionalContent?: string;
    writer: chalk.Chalk;
}

function logMessage({ packageName = "monorepoLint", message, additionalContent, writer }: LogMessageArgs): void {
    console.group(`${writer.bold(`[${packageName}]`)} ${message}`);
    if (additionalContent != null && additionalContent.length > 0) {
        console.log(additionalContent);
    }
    console.groupEnd();
}
