import { FernToken, FernUserToken, getAccessToken, verifyAndDecodeJwt } from "@fern-api/auth";
import { Log, TtyAwareLogger } from "@fern-api/cli-logger";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger, LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";
import { getTokenFromAuth0 } from "@fern-api/login";
import chalk from "chalk";
import inquirer from "inquirer";
import { CredentialStore, TokenService } from "../auth/index.js";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { CliError } from "../errors/CliError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { Target } from "../sdk/config/Target.js";
import { Icons } from "../ui/format.js";
import type { Workspace } from "../workspace/Workspace.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { TaskContextAdapter } from "./adapter/TaskContextAdapter.js";
import { LogFileWriter } from "./LogFileWriter.js";

export class Context {
    private ttyAwareLogger: TtyAwareLogger;

    public readonly cwd: AbsoluteFilePath;
    public readonly logLevel: LogLevel;
    public readonly stdout: Logger;
    public readonly stderr: Logger;
    public readonly logFileWriter: LogFileWriter;
    public readonly tokenService: TokenService;

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
        this.logFileWriter = new LogFileWriter();
        this.stdout = createLogger((level: LogLevel, ...args: string[]) => this.log(level, ...args));
        this.stderr = createLogger((level: LogLevel, ...args: string[]) => this.logStderr(level, ...args));
        this.tokenService = new TokenService({ credential: new CredentialStore() });
    }

    public async loadWorkspaceOrThrow(): Promise<Workspace> {
        const fernYml = await loadFernYml({ cwd: this.cwd });

        const loader = new WorkspaceLoader({ cwd: this.cwd, logger: this.stderr });
        const result = await loader.load({ fernYml });
        if (!result.success) {
            throw new ValidationError(result.issues);
        }

        return result.workspace;
    }

    /**
     * Get a valid token, prompting to login if necessary.
     *
     * Checks in order:
     *  1. FERN_TOKEN env var (organization token) - returns immediately if set
     *  2. User token from keyring - verifies JWT and prompts to re-login if expired
     *
     * If there's no token or the token is invalid/expired:
     *  - In TTY mode: prompts "Login required. Continue?" and re-authenticates.
     *  - In non-TTY mode: throws an error with instructions to run `fern auth login` or set the FERN_TOKEN environment variable.
     *
     * @returns A valid FernToken (either organization or user token)
     * @throws CliError if not logged in and not in TTY mode, or if user declines to login
     */
    public async getTokenOrPrompt(): Promise<FernToken> {
        const envToken = await getAccessToken();
        if (envToken != null) {
            return envToken;
        }

        const token = await this.tokenService.getActiveToken();
        if (token == null) {
            if (!this.isTTY) {
                this.stderr.warn(`${chalk.yellow("⚠")} You are not logged in to Fern.`);
                this.stderr.info("");
                this.stderr.info(
                    chalk.dim("  To authenticate, run: 'fern auth login' or set the FERN_TOKEN environment variable")
                );
                throw CliError.exit();
            }
            return await this.promptAndLogin();
        }

        const decoded = await verifyAndDecodeJwt(token);
        if (decoded == null) {
            if (!this.isTTY) {
                this.stderr.error(`${Icons.error} Your access token has expired.`);
                this.stderr.info("");
                this.stderr.info(
                    chalk.dim("  To authenticate, run: 'fern auth login' or set the FERN_TOKEN environment variable")
                );
                throw CliError.exit();
            }
            return await this.promptAndLogin();
        }

        return { type: "user", value: token };
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

    private async promptAndLogin(): Promise<FernUserToken> {
        const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: "confirm",
                name: "confirm",
                message: "Login required. Continue?",
                default: true
            }
        ]);

        if (!confirm) {
            throw CliError.exit();
        }

        this.stderr.info(`${Icons.info} Opening browser to log in to Fern...`);
        this.stderr.info(chalk.dim("  If the browser doesn't open, try: fern auth login --device-code"));

        const taskContext = new TaskContextAdapter({ context: this });
        const { accessToken, idToken } = await getTokenFromAuth0(taskContext, {
            useDeviceCodeFlow: false,
            forceReauth: true
        });

        const payload = await verifyAndDecodeJwt(idToken);
        if (payload == null) {
            this.stderr.error(`${Icons.error} Internal error; could not verify ID token`);
            throw CliError.exit();
        }

        const email = payload.email;
        if (email == null) {
            this.stderr.error(`${Icons.error} Internal error; ID token does not contain email claim`);
            throw CliError.exit();
        }

        await this.tokenService.login(email, accessToken);

        this.stderr.info(`${Icons.success} Logged in as ${chalk.bold(email)}`);

        return { type: "user", value: accessToken };
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
