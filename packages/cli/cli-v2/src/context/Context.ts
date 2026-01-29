import { FernToken, getToken } from "@fern-api/auth";
import { Log, TtyAwareLogger } from "@fern-api/cli-logger";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger, LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";
import { CliError } from "../errors/CliError";
import { Target } from "../sdk/config/Target";
import { LogFileWriter } from "./LogFileWriter";

export class Context {
    private ttyAwareLogger: TtyAwareLogger;

    public readonly cwd: AbsoluteFilePath;
    public readonly logLevel: LogLevel;
    public readonly stdout: Logger;
    public readonly stderr: Logger;
    public readonly logFileWriter: LogFileWriter;

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
        this.logFileWriter = new LogFileWriter({ cwd: this.cwd });
        this.stdout = createLogger((level: LogLevel, ...args: string[]) => this.log(level, ...args));
        this.stderr = createLogger((level: LogLevel, ...args: string[]) => this.logStderr(level, ...args));
    }

    /**
     * Returns true if running in an interactive TTY environment (not CI).
     * Delegates to TtyAwareLogger which handles the is-ci check.
     */
    public get isTTY(): boolean {
        return this.ttyAwareLogger.isTTY;
    }

    /**
     * Get the log file path if logs have been written.
     */
    public getLogFilePath(): AbsoluteFilePath | undefined {
        if (this.logFileWriter.hasLogs()) {
            return this.logFileWriter.logFilePath;
        }
        return undefined;
    }

    /** Get the authentication token or throw an error if it's not available. */
    public async getAuthTokenOrThrow(): Promise<FernToken> {
        const token = await this.getAuthToken();
        if (token == null) {
            throw CliError.authRequired();
        }
        return token;
    }

    /** Get the authentication token or return undefined if it's not available. */
    public async getAuthToken(): Promise<FernToken | undefined> {
        return await getToken();
    }

    public resolveTargetOutputs(target: Target): string[] | undefined {
        const outputs: string[] = [];
        if (target.output.path != null) {
            const outputPath = this.resolveOutputFilePath(target.output.path);
            if (outputPath != null) {
                outputs.push(outputPath.toString());
            }
        }
        if (target.output.git != null) {
            // TODO: Include a link to the branch, commit, or release that was created.
            outputs.push(target.output.git.repository);
        }
        return outputs;
    }

    /**
     * Resolve an output file path relative to the current working directory.
     *
     * If the path starts with "/", it's treated as absolute.
     * Otherwise, it's resolved relative to cwd.
     *
     * @param outputPath - The output path to resolve (or undefined)
     * @returns Absolute path, or undefined if outputPath is undefined
     */
    public resolveOutputFilePath(outputPath: string | undefined): AbsoluteFilePath | undefined {
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
