import { Log, logErrorMessage, TtyAwareLogger } from "@fern-api/cli-logger";
import { createLogger, LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { getPosthogManager, PosthogManager } from "@fern-api/posthog-manager";
import { Project } from "@fern-api/project-loader";
import { isVersionAhead } from "@fern-api/semver-utils";
import {
    CliError,
    Finishable,
    PosthogEvent,
    Startable,
    TaskAbortSignal,
    TaskContext,
    TaskResult
} from "@fern-api/task-context";

import { Workspace } from "@fern-api/workspace-loader";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { maxBy } from "lodash-es";
import { reportError } from "../telemetry/reportError.js";
import { SentryClient } from "../telemetry/SentryClient.js";
import { CliEnvironment } from "./CliEnvironment.js";
import { StdoutRedirector } from "./StdoutRedirector.js";
import { TaskContextImpl } from "./TaskContextImpl.js";
import { getFernUpgradeMessage } from "./upgrade-utils/getFernUpgradeMessage.js";
import { FernGeneratorUpgradeInfo, getProjectGeneratorUpgrades } from "./upgrade-utils/getGeneratorVersions.js";
import { getLatestVersionOfCli } from "./upgrade-utils/getLatestVersionOfCli.js";

const WORKSPACE_NAME_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export interface FernCliUpgradeInfo {
    isUpgradeAvailable: boolean;
    latestVersion: string;
}

export interface FernUpgradeInfo {
    cliUpgradeInfo: FernCliUpgradeInfo | undefined;
    generatorUpgradeInfo: FernGeneratorUpgradeInfo[];
}

export class CliContext {
    public readonly environment: CliEnvironment;
    private readonly sentryClient: SentryClient;
    private readonly posthogManager: PosthogManager;

    private didSucceed = true;

    private numTasks = 0;
    private ttyAwareLogger: TtyAwareLogger;

    private logLevel: LogLevel = LogLevel.Info;
    private isLocal: boolean;
    private readonly stdoutRedirector = new StdoutRedirector();
    private jsonMode = false;

    public static async create(
        stdout: NodeJS.WriteStream,
        stderr: NodeJS.WriteStream,
        { isLocal }: { isLocal?: boolean }
    ): Promise<CliContext> {
        const posthogManager = await getPosthogManager();
        return new CliContext(stdout, stderr, { isLocal, posthogManager });
    }

    protected constructor(
        stdout: NodeJS.WriteStream,
        stderr: NodeJS.WriteStream,
        { isLocal, posthogManager }: { isLocal?: boolean; posthogManager: PosthogManager }
    ) {
        this.ttyAwareLogger = new TtyAwareLogger(stdout, stderr);
        this.isLocal = isLocal ?? false;
        this.posthogManager = posthogManager;

        const packageName = this.getPackageName();
        const packageVersion = this.getPackageVersion();
        const cliName = this.getCliName();
        if (packageName == null || packageVersion == null || cliName == null) {
            this.exitProgram();
        }
        this.environment = {
            packageName,
            packageVersion,
            cliName
        };
        this.sentryClient = new SentryClient({ release: `cli@${this.environment.packageVersion}` });
    }

    private getPackageName() {
        if (process.env.CLI_PACKAGE_NAME == null) {
            this.logger.error("CLI_PACKAGE_NAME is not defined");
        }
        return process.env.CLI_PACKAGE_NAME;
    }

    private getPackageVersion() {
        if (process.env.CLI_VERSION == null) {
            this.logger.error("CLI_VERSION is not defined");
        }
        return process.env.CLI_VERSION;
    }

    private getCliName() {
        if (process.env.CLI_NAME == null) {
            this.logger.error("CLI_NAME is not defined");
        }
        return process.env.CLI_NAME;
    }

    public setLogLevel(logLevel: LogLevel): void {
        this.logLevel = logLevel;
    }

    public logFernVersionDebug(): void {
        this.logger.debug(
            `Running ${chalk.bold(`${this.environment.cliName}`)} (${this.environment.packageName}@${
                this.environment.packageVersion
            })`
        );
    }

    public failAndThrow(message?: string, error?: unknown, options?: { code?: CliError.Code }): never {
        this.failWithoutThrowing(message, error, options);
        throw new TaskAbortSignal();
    }

    public failWithoutThrowing(message?: string, error?: unknown, options?: { code?: CliError.Code }): void {
        this.didSucceed = false;
        if (error instanceof TaskAbortSignal) {
            return;
        }
        logErrorMessage({ message, error, logger: this.logger });
        reportError(this, error, { ...options, message });
    }

    /**
     * Activate JSON-output mode: all logger output is forced to stderr
     * and process.stdout is redirected to stderr as a safety net for
     * third-party code. Call this as early as possible (e.g. in yargs
     * middleware) so that even pre-command logs stay off stdout.
     */
    public enableJsonMode(): void {
        if (this.jsonMode) {
            return;
        }
        this.jsonMode = true;
        this.stdoutRedirector.redirect();
    }

    public get isJsonMode(): boolean {
        return this.jsonMode;
    }

    /**
     * Write a value as formatted JSON to stdout.
     * Temporarily restores the real stdout, writes, then re-redirects.
     */
    public writeJsonToStdout(value: unknown): void {
        this.stdoutRedirector.restore();
        process.stdout.write(JSON.stringify(value, null, 2) + "\n");
        if (this.jsonMode) {
            this.stdoutRedirector.redirect();
        }
    }

    public async exit({ code }: { code?: number } = {}): Promise<never> {
        if (!this._suppressUpgradeMessage && !this.isLocal) {
            await this.nudgeUpgradeIfAvailable();
        }
        this.ttyAwareLogger.finish();
        try {
            await this.posthogManager.flush();
        } catch {
            // Silently swallow – analytics should never block the CLI
        }
        await this.sentryClient.flush();
        this.exitProgram({ code });
    }

    private async nudgeUpgradeIfAvailable() {
        try {
            const upgradeInfo = await Promise.race<[Promise<FernUpgradeInfo>, Promise<never>]>([
                this.isUpgradeAvailable(),
                new Promise((_resolve, reject) => setTimeout(() => reject("Request timed out"), 300))
            ]);

            let upgradeMessage = await getFernUpgradeMessage({
                cliEnvironment: this.environment,
                upgradeInfo
            });
            if (upgradeMessage != null) {
                if (!upgradeMessage.endsWith("\n")) {
                    upgradeMessage += "\n";
                }
                this.stderr.info(upgradeMessage);
            }
        } catch {
            // swallow error when failing to check for upgrade
        }
    }

    public async exitIfFailed(): Promise<void> {
        if (!this.didSucceed) {
            await this.exit();
        }
    }

    private exitProgram({ code }: { code?: number } = {}): never {
        process.exit(code ?? (this.didSucceed ? 0 : 1));
    }

    private longestWorkspaceName: string | undefined;
    public registerWorkspaces(workspaces: readonly Workspace[]): void {
        const longestWorkspaceName = maxBy(
            workspaces.map((workspace) => (workspace.type === "docs" ? "docs" : (workspace.workspaceName ?? "api"))),
            (name) => name.length
        );
        if (longestWorkspaceName != null) {
            this.longestWorkspaceName = longestWorkspaceName;
        }
    }

    private project: Project | undefined;
    public registerProject(project: Project): void {
        this.project = project;
    }

    public runTask<T>(run: (context: TaskContext) => T | Promise<T>): Promise<T> {
        return this.runTaskWithInit(this.constructTaskInit(), run);
    }

    public addTask(): Startable<TaskContext & Finishable> {
        return this.addTaskWithInit(this.constructTaskInit());
    }

    public async runTaskForWorkspace(
        workspace: Workspace,
        run: (context: TaskContext) => void | Promise<void>
    ): Promise<void> {
        await this.runTaskWithInit(this.constructTaskInitForWorkspace(workspace), run);
    }

    private addTaskWithInit(init: TaskContextImpl.Init): Startable<TaskContext & Finishable> {
        const context = new TaskContextImpl(init);
        this.ttyAwareLogger.registerTask(context);
        return context;
    }

    private readonly USE_NODE_18_OR_ABOVE_MESSAGE = "The Fern CLI requires Node 18+ or above.";
    private async runTaskWithInit<T>(
        init: TaskContextImpl.Init,
        run: (context: TaskContext) => T | Promise<T>
    ): Promise<T> {
        const context = this.addTaskWithInit(init).start();
        let result: T;
        try {
            result = await run(context);
        } catch (error) {
            context.failWithoutThrowing(undefined, error);

            // We need to throw a TaskAbortSignal to stop execution.
            throw new TaskAbortSignal();
        } finally {
            context.finish();
        }
        return result;
    }

    public instrumentPostHogEvent(event: PosthogEvent): void {
        if (!this.isLocal) {
            this.posthogManager.sendEvent(event);
        }
    }

    public captureException(error: unknown, code?: CliError.Code): void {
        this.sentryClient.captureException(error, code);
    }

    public readonly logger = createLogger((level, ...args) => this.log(level, ...args));
    public readonly stderr = createLogger((level, ...args) => this.logStderr(level, ...args));

    private constructTaskInitForWorkspace(workspace: Workspace): TaskContextImpl.Init {
        const workspaceName = workspace.type === "docs" ? "docs" : (workspace.workspaceName ?? "api");
        const prefixWithoutPadding = wrapWorkspaceNameForPrefix(workspaceName);

        // we want all the prefixes to be the same length, so use this.longestWorkspaceName
        // if it's defined. (+1 so there's a space after the prefix)
        const minLengthForPrefix =
            1 +
            (this.longestWorkspaceName != null
                ? wrapWorkspaceNameForPrefix(this.longestWorkspaceName)
                : prefixWithoutPadding
            ).length;

        const prefix = prefixWithoutPadding.padEnd(minLengthForPrefix);

        // biome-ignore lint/style/noNonNullAssertion: allow
        const colorForWorkspace = WORKSPACE_NAME_COLORS[this.numTasks++ % WORKSPACE_NAME_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        return {
            ...this.constructTaskInit(),
            logPrefix: prefixWithColor,
            title: chalk.hex(colorForWorkspace).bold(workspaceName)
        };
    }

    private constructTaskInit(): TaskContextImpl.Init {
        return {
            logImmediately: (content) => this.logImmediately(content),
            takeOverTerminal: (run) => this.ttyAwareLogger.takeOverTerminal(run),
            onResult: (result) => {
                if (result === TaskResult.Failure) {
                    this.didSucceed = false;
                }
            },
            instrumentPostHogEvent: (event) => {
                this.instrumentPostHogEvent(event);
            },
            shouldBufferLogs: false,
            captureException: (error, code) => {
                this.sentryClient.captureException(error, code);
            }
        };
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
            stderr: stderr || this.jsonMode
        });
    }

    private _suppressUpgradeMessage = false;
    public suppressUpgradeMessage(): void {
        this._suppressUpgradeMessage = true;
    }

    private _isUpgradeAvailable: FernUpgradeInfo | undefined;
    public async isUpgradeAvailable({
        includePreReleases = false
    }: {
        includePreReleases?: boolean;
    } = {}): Promise<FernUpgradeInfo> {
        if (this._isUpgradeAvailable == null) {
            // Check if the CLI is upgradable
            this.logger.debug(`Checking if ${this.environment.packageName} upgrade is available...`);

            const latestPackageVersion = await getLatestVersionOfCli({
                cliEnvironment: this.environment,
                includePreReleases
            });
            const isUpgradeAvailable = isVersionAhead(latestPackageVersion, this.environment.packageVersion);

            this.logger.debug(
                `Latest version: ${latestPackageVersion}. ` +
                    (isUpgradeAvailable ? "Upgrade available." : "No upgrade available.")
            );

            const cliUpgrade: FernCliUpgradeInfo = {
                isUpgradeAvailable,
                latestVersion: latestPackageVersion
            };

            // Check if the generators are upgradable
            const generatorUpgrades: FernGeneratorUpgradeInfo[] = await getProjectGeneratorUpgrades({
                project: this.project,
                cliContext: this
            });

            this._isUpgradeAvailable = {
                cliUpgradeInfo: cliUpgrade,
                generatorUpgradeInfo: generatorUpgrades
            };
        }
        return this._isUpgradeAvailable;
    }

    /**
     * Prompts the user for confirmation with an interactive selection menu
     * Users can navigate with arrow keys (↑/↓) and select with Enter
     * Defaults to "No" for safety on destructive actions
     * Supports Ctrl+C for cancellation (throws error which should be caught)
     * @param message The message to display to the user
     * @param defaultValue Optional default value (defaults to false - "No")
     * @returns Promise<boolean> representing the user's choice
     */
    public async confirmPrompt(message: string, defaultValue = false): Promise<boolean> {
        try {
            const answer = await select({
                message,
                choices: [
                    { name: "No", value: false },
                    { name: "Yes", value: true }
                ],
                default: defaultValue,
                theme: {
                    prefix: chalk.yellow("?"),
                    style: {
                        answer: (text: string) => chalk.cyan(text),
                        message: (text: string) => chalk.bold(text),
                        highlight: (text: string) => chalk.cyan(text)
                    }
                }
            });
            return answer;
        } catch (error) {
            // User pressed Ctrl+C
            if ((error as Error)?.name === "ExitPromptError") {
                this.logger.info("\nCancelled by user.");
                throw new TaskAbortSignal();
            }
            throw error;
        }
    }

    /**
     * Prompts the user for text input
     * @param message The message to display to the user
     * @param default Optional default value (defaults to undefined)
     * @returns Promise<string> representing the user's input
     */
    public async getInput(config: { message: string; default?: string }): Promise<string> {
        try {
            return await input({ message: config.message, default: config.default });
        } catch (error) {
            if ((error as Error)?.name === "ExitPromptError") {
                this.logger.info("\nCancelled by user.");
                throw new TaskAbortSignal();
            }
            throw error;
        }
    }
}

function wrapWorkspaceNameForPrefix(workspaceName: string): string {
    return `[${workspaceName}]:`;
}
