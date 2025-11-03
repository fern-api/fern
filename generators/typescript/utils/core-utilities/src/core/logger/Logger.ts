export interface Logger {
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
    public debug(message: string, metadata?: Record<string, unknown>): void {
        console.debug(message, metadata);
    }

    public info(message: string, metadata?: Record<string, unknown>): void {
        console.info(message, metadata);
    }

    public warn(message: string, metadata?: Record<string, unknown>): void {
        console.warn(message, metadata);
    }

    public error(message: string, metadata?: Record<string, unknown>): void {
        console.error(message, metadata);
    }
}

export function createLogger(enabled: boolean | Logger): Logger | undefined {
    if (enabled === true) {
        return new ConsoleLogger();
    } else if (enabled === false) {
        return undefined;
    } else {
        return enabled;
    }
}
