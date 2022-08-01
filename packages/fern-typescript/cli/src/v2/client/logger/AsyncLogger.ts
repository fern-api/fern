import { noop } from "@fern-api/core-utils";
import { LogLevel } from "@fern-fern/generator-logging-api-client/model";
import { Logger } from "./Logger";

export class AsyncLogger implements Logger {
    private promise: Promise<void> = Promise.resolve();
    public async waitForLogsToHaveSent(): Promise<void> {
        await this.promise;
    }

    public log(message: string, level: LogLevel): void {
        if (this.remoteLogger != null) {
            const remoteLogger = this.remoteLogger;
            this.promise = this.promise.then(() => remoteLogger(message, level).catch(noop));
        }
    }

    public debug(message: string): void {
        this.log(message, LogLevel.Debug);
    }

    public info(message: string): void {
        this.log(message, LogLevel.Info);
    }

    public warn(message: string): void {
        this.log(message, LogLevel.Warn);
    }

    public error(message: string): void {
        this.log(message, LogLevel.Error);
    }

    constructor(private readonly remoteLogger: ((message: string, level: LogLevel) => Promise<void>) | undefined) {}
}
