import { Values } from "@fern-api/core-utils";

export interface Logger {
    debug: (value: string) => void;
    info: (value: string) => void;
    warn: (value: string) => void;
    error: (value: string) => void;
    log: (value: string, level: LogLevel) => void;
}

export const LogLevel = {
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error",
} as const;

export type LogLevel = Values<typeof LogLevel>;

export const LOG_LEVELS = Object.values(LogLevel);
