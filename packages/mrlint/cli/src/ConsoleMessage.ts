import { LogLevel, Package, Rule } from "@mrlint/commons";
import chalk from "chalk";
import { isNativeError } from "util/types";

const CHALKS: Record<LogLevel, (content: string) => string> = {
    [LogLevel.ERROR]: chalk.red,
    [LogLevel.WARN]: chalk.keyword("orange"),
    [LogLevel.INFO]: (content) => content,
    [LogLevel.DEBUG]: chalk.gray,
};

const LABELS: Record<LogLevel, string> = {
    [LogLevel.ERROR]: "ERROR",
    [LogLevel.WARN]: "WARN",
    [LogLevel.INFO]: "INFO",
    [LogLevel.DEBUG]: "DEBUG",
};

export interface ConsoleMessageMetadata {
    title: string;
    additionalContent: string | undefined;
    error?: unknown;
    package?: Package;
    rule?: Rule;
}

export class ConsoleMessage {
    private level: LogLevel;
    private maxLevel: LogLevel;
    private metadata: ConsoleMessageMetadata;

    constructor({ level, maxLevel, ...metadata }: ConsoleMessageMetadata & { level: LogLevel; maxLevel: LogLevel }) {
        this.level = level;
        this.maxLevel = maxLevel;
        this.metadata = metadata;
    }

    public print(): void {
        if (this.level > this.maxLevel) {
            return;
        }

        const titleParts: string[] = [];
        titleParts.push(chalk.underline(this.addColorForLevel(LABELS[this.level])));
        if (this.metadata.package != null) {
            titleParts.push(chalk.bold(this.metadata.package.relativePath));
        }
        if (this.metadata.rule != null) {
            titleParts.push(chalk.gray(`[${this.metadata.rule.ruleId}]`));
        }
        titleParts.push(this.metadata.title);
        console.group(titleParts.join(" "));

        if (this.metadata.additionalContent != null) {
            console.log(this.metadata.additionalContent);
        }
        if (this.metadata.error != null) {
            console.log(
                isNativeError(this.metadata.error)
                    ? `${this.metadata.error.name} ${this.metadata.error.message}`
                    : JSON.stringify(this.metadata.error)
            );
        }

        console.groupEnd();
    }

    private addColorForLevel(x: string): string {
        return CHALKS[this.level](x);
    }
}
