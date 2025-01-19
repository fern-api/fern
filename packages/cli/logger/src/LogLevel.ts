import { Values } from "@fern-api/core-utils";

export const LogLevel = {
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error",
    Trace: "trace"
} as const;

export type LogLevel = Values<typeof LogLevel>;

export const LOG_LEVELS = Object.values(LogLevel);
