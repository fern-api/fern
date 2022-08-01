import { LogLevel } from "@fern-fern/generator-logging-api-client/model";

export interface Logger {
    log: (message: string, level: LogLevel) => void;
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}
