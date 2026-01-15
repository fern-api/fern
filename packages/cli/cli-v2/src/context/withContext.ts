import { LogLevel } from "@fern-api/logger";
import { Context } from "./Context";
import type { GlobalArgs } from "./GlobalArgs";

export function withContext<T extends GlobalArgs>(
    handler: (context: Context, args: T) => Promise<void>
): (args: T) => Promise<void> {
    return async (args: T) => {
        const context = createContext(args);
        return handler(context, args);
    };
}

function createContext(options: GlobalArgs): Context {
    const logLevel = parseLogLevel(options["log-level"] ?? "info");
    return new Context({
        stdout: process.stdout,
        stderr: process.stderr,
        logLevel
    });
}

function parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
        case "debug":
            return LogLevel.Debug;
        case "info":
            return LogLevel.Info;
        case "warn":
            return LogLevel.Warn;
        case "error":
            return LogLevel.Error;
        default:
            return LogLevel.Info;
    }
}
