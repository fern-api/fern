import { FernToken, getToken } from "@fern-api/auth";
import { Log, TtyAwareLogger } from "@fern-api/cli-logger";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger, LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";
import { CliError } from "../errors/CliError";

export class Context {
    private ttyAwareLogger: TtyAwareLogger;

    public readonly cwd: AbsoluteFilePath;
    public readonly logLevel: LogLevel;
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
        cwd?: AbsoluteFilePath;
        logLevel?: LogLevel;
    }) {
        this.cwd = cwd ?? AbsoluteFilePath.of(process.cwd());
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

    public async getAuthTokenOrThrow(): Promise<FernToken> {
        const token = await this.getAuthToken();
        if (token == null) {
            throw CliError.authRequired();
        }
        return token;
    }

    public async getAuthToken(): Promise<FernToken | undefined> {
        return await getToken();
    }

    /**
     * Resolve an output path relative to the current working directory.
     *
     * If the path starts with "/", it's treated as absolute.
     * Otherwise, it's resolved relative to cwd.
     *
     * @param outputPath - The output path to resolve (or undefined)
     * @returns Absolute path, or undefined if outputPath is undefined
     */
    public resolveOutputPath(outputPath: string | undefined): AbsoluteFilePath | undefined {
        if (outputPath == null) {
            return undefined;
        }
        if (outputPath.startsWith("/")) {
            return AbsoluteFilePath.of(outputPath);
        }
        return join(this.cwd, RelativeFilePath.of(outputPath));
    }

    /**
     * Get the TtyAwareLogger for coordinated task display.
     * Use this to register tasks that need TTY-aware rendering.
     */
    public getTtyAwareLogger(): TtyAwareLogger {
        return this.ttyAwareLogger;
    }

    /**
     * Finish the TtyAwareLogger (call when exiting the CLI).
     */
    public finish(): void {
        this.ttyAwareLogger.finish();
    }
}
