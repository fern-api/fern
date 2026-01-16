import { Log, TtyAwareLogger } from "@fern-api/cli-logger";
import { createLogger, LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";

export class Context {
    private logLevel: LogLevel;
    private ttyAwareLogger: TtyAwareLogger;
    public readonly cwd: string;
    public readonly stdout: Logger;
    public readonly stderr: Logger;

    constructor({
        stdout,
        stderr,
        cwd,
        logLevel
    }: {
        stdout: NodeJS.WriteStream;
        stderr: NodeJS.WriteStream;
        cwd?: string;
        logLevel?: LogLevel;
    }) {
        this.cwd = cwd ?? process.cwd();
        this.logLevel = logLevel ?? LogLevel.Info;
        this.ttyAwareLogger = new TtyAwareLogger(stdout, stderr);
        this.stdout = createLogger((level: LogLevel, ...args: string[]) => this.log(level, ...args));
        this.stderr = createLogger((level: LogLevel, ...args: string[]) => this.logStderr(level, ...args));
    }

    private log(level: LogLevel, ...parts: string[]) {
        this.logImmediately([
            {
                parts,
                level,
                time: new Date()
            }
        ]);
    }

    private logStderr(level: LogLevel, ...parts: string[]) {
        this.logImmediately(
            [
                {
                    parts,
                    level,
                    time: new Date()
                }
            ],
            { stderr: true }
        );
    }

    private logImmediately(logs: Log[], { stderr = false }: { stderr?: boolean } = {}): void {
        const filtered = logs.filter((log) => LOG_LEVELS.indexOf(log.level) >= LOG_LEVELS.indexOf(this.logLevel));
        this.ttyAwareLogger.log(filtered, {
            includeDebugInfo: this.logLevel === LogLevel.Debug,
            stderr
        });
    }
}
