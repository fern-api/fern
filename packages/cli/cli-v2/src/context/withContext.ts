import { LogLevel } from "@fern-api/logger";
import { Context } from "./Context";
import { GlobalOptions } from "./GlobalOptions";

export function withContext<T>(handler: (context: Context, args: T) => Promise<void>) {
    return (args: T) => {
        const globalOptions: GlobalOptions = {
            verbose: (args as GlobalOptions).verbose,
            logLevel: (args as GlobalOptions).logLevel
        };
        const context = createContext(globalOptions);
        return handler(context, args);
    };
}

function createContext(options: GlobalOptions): Context {
    const logLevel = options.verbose ? LogLevel.Debug : parseLogLevel(options.logLevel || "info");
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
