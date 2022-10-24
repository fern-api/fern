import { LogLevel } from "./LogLevel";

export interface Logger {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    log: (level: LogLevel, arg: unknown, ...args: unknown[]) => void;
}
