import { identity } from "@fern-api/core-utils";
import { LogLevel } from "@fern-api/task-context";
import chalk from "chalk";

export interface LogWithLevel {
    content: string;
    level: LogLevel;
}

export function getLogWithColor({ content, level }: LogWithLevel): string {
    return getWrapperForLevel(level)(content);
}

function getWrapperForLevel(level: LogLevel): (content: string) => string {
    switch (level) {
        case LogLevel.Debug:
            return identity;
        case LogLevel.Info:
            return identity;
        case LogLevel.Warn:
            return chalk.hex("#FFA500");
        case LogLevel.Error:
            return chalk.red;
    }
}
