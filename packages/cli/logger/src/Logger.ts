import { LogLevel } from "./LogLevel";

export interface Logger {
    debug: (arg: unknown, ...args: unknown[]) => void;
    info: (arg: unknown, ...args: unknown[]) => void;
    warn: (arg: unknown, ...args: unknown[]) => void;
    error: (arg: unknown, ...args: unknown[]) => void;
    log: (level: LogLevel, arg: unknown, ...args: unknown[]) => void;
}
