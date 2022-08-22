import { Logger, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { TaskContext, TaskResult, TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { ArgumentsCamelCase } from "yargs";
import { CliEnvironment } from "./CliEnvironment";
import { InteractiveTaskManager } from "./InteractiveTaskManager";
import { LogWithLevel } from "./LogWithLevel";
import { TaskContextImpl } from "./TaskContextImpl";
import { getFernCliUpgradeMessage } from "./upgrade-utils/getFernCliUpgradeMessage";

const WORKSPACE_NAME_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export interface GlobalCliOptions {
    "log-level": LogLevel;
}

export class CliContext {
    public readonly environment: CliEnvironment;

    public suppressUpgradeMessage = false;

    private didSucceed = true;

    private numTasks = 0;
    private stream = process.stdout;
    private interactiveTaskManager = new InteractiveTaskManager(this.stream);

    private logLevel: LogLevel = LogLevel.Info;

    constructor() {
        const packageName = this.getPackageName();
        const packageVersion = this.getPackageVersion();
        const cliName = this.getCliName();
        if (packageName == null || packageVersion == null || cliName == null) {
            this.exitProgram();
        }
        this.environment = {
            packageName,
            packageVersion,
            cliName,
        };
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

    public processArgv(argv: ArgumentsCamelCase<GlobalCliOptions>): void {
        this.logLevel = argv.logLevel;
    }

    public fail(message?: string): TASK_FAILURE {
        this.didSucceed = false;
        if (message != null) {
            this.logger.error(message);
        }
        return TASK_FAILURE;
    }

    public async exit(): Promise<never> {
        this.interactiveTaskManager.finish();
        if (!this.suppressUpgradeMessage) {
            const upgradeMessage = await getFernCliUpgradeMessage(this.environment);
            if (upgradeMessage != null) {
                this.stream.write(upgradeMessage);
            }
        }
        this.exitProgram();
    }

    private exitProgram(): never {
        process.exit(this.didSucceed ? 0 : 1);
    }

    private longestWorkspaceNameLength = 0;
    public registerWorkspaces(workspaces: readonly Workspace[]): void {
        this.longestWorkspaceNameLength = Math.max(...workspaces.map((workspace) => workspace.name.length));
    }

    public async runTask(run: (context: TaskContext) => void | Promise<void>): Promise<void> {
        await this.runTaskWithInit(
            {
                log: (logs) => this.log(logs),
            },
            run
        );
    }

    public async runTaskForWorkspace(
        workspace: Workspace,
        run: (context: TaskContext) => void | Promise<void>
    ): Promise<void> {
        await this.runTaskWithInit(this.constructTaskInitForWorkspace(workspace), run);
    }

    private async runTaskWithInit(
        init: TaskContextImpl.Init,
        run: (context: TaskContext) => void | Promise<void>
    ): Promise<void> {
        const context = new TaskContextImpl(init);
        this.interactiveTaskManager.registerTask(context);
        await run(context);
        await this.handleFinishedTask(context);
    }

    get logger(): Logger {
        return {
            debug: (content) => {
                this.log([
                    {
                        content,
                        level: LogLevel.Debug,
                    },
                ]);
            },
            info: (content) => {
                this.log([
                    {
                        content,
                        level: LogLevel.Info,
                    },
                ]);
            },
            warn: (content) => {
                this.log([
                    {
                        content,
                        level: LogLevel.Warn,
                    },
                ]);
            },
            error: (content) => {
                this.log([
                    {
                        content,
                        level: LogLevel.Error,
                    },
                ]);
            },
            log: (content, level) => {
                this.log([
                    {
                        content,
                        level,
                    },
                ]);
            },
        };
    }

    private async handleFinishedTask(context: TaskContextImpl): Promise<void> {
        if (context.getResult() === TaskResult.Failure) {
            this.didSucceed = false;
        }
        context.finish();
    }

    private constructTaskInitForWorkspace(workspace: Workspace): TaskContextImpl.Init {
        const prefix = wrapWorkspaceNameForPrefix(workspace.name).padEnd(
            wrapWorkspaceNameForPrefix("X".repeat(this.longestWorkspaceNameLength)).length
        );
        const colorForWorkspace = WORKSPACE_NAME_COLORS[this.numTasks++ % WORKSPACE_NAME_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        return {
            log: (content) => this.log(content),
            logPrefix: prefixWithColor,
        };
    }

    private log(logs: LogWithLevel[]): void {
        if (logs.length === 0) {
            return;
        }
        const str =
            logs
                .reduce<string[]>((filtered, { content, level }) => {
                    const shouldIncludeLogLevel = LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.logLevel);
                    if (shouldIncludeLogLevel) {
                        const trimmed = content.trim();
                        switch (level) {
                            case LogLevel.Error:
                                filtered.push(chalk.red(trimmed));
                                break;
                            case LogLevel.Warn:
                                filtered.push(chalk.hex("FFA500")(trimmed));
                                break;
                            case LogLevel.Debug:
                            case LogLevel.Info:
                                filtered.push(trimmed);
                        }
                    }
                    return filtered;
                }, [])
                .join("\n") + "\n";

        this.interactiveTaskManager.repaint({
            contentAbove: str,
        });
    }
}

function wrapWorkspaceNameForPrefix(workspaceName: string): string {
    return `[${workspaceName}]:`;
}
