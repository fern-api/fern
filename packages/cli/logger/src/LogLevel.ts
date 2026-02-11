import { Values } from "@fern-api/core-utils";

export const LogLevel = {
    Trace: "trace",
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error"
} as const;

export type LogLevel = Values<typeof LogLevel>;

export const LOG_LEVELS: Array<"trace" | "debug" | "info" | "warn" | "error"> = Object.values(LogLevel);
