import { Logger, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { Finishable, Startable, TaskContext, TaskResult, TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { ArgumentsCamelCase } from "yargs";
import { CliEnvironment } from "./CliEnvironment";
import { constructErrorMessage } from "./constructErrorMessage";
import { Log, LogWithLevel } from "./Log";
import { TaskContextImpl } from "./TaskContextImpl";
import { TtyAwareLogger } from "./TtyAwareLogger";
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
    private ttyAwareLogger: TtyAwareLogger;

    private logLevel: LogLevel = LogLevel.Info;

    constructor(private readonly stream: NodeJS.WriteStream) {
        this.ttyAwareLogger = new TtyAwareLogger(stream);

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

    public fail(message?: string, error?: unknown): TASK_FAILURE;
    public fail(error: unknown): TASK_FAILURE;
    public fail(messageOrError?: unknown, error?: unknown): TASK_FAILURE {
        this.didSucceed = false;
        const errorMessage = constructErrorMessage({ messageOrError, error });
        if (errorMessage != null) {
            this.logger.error(errorMessage);
        }
        return TASK_FAILURE;
    }

    public async exit(): Promise<never> {
        this.ttyAwareLogger.finish();
        if (!this.suppressUpgradeMessage) {
            const upgradeMessage = await getFernCliUpgradeMessage(this.environment);
            if (upgradeMessage != null) {
                this.stream.write(upgradeMessage);
            }
        }
        this.exitProgram();
    }

    public async exitIfFailed(): Promise<void> {
        if (!this.didSucceed) {
            await this.exit();
        }
    }

    private exitProgram(): never {
        process.exit(this.didSucceed ? 0 : 1);
    }

    private longestWorkspaceNameLength = 0;
    public registerWorkspaces(workspaces: readonly Workspace[]): void {
        this.longestWorkspaceNameLength = Math.max(...workspaces.map((workspace) => workspace.name.length));
    }

    public async runTask(run: (context: TaskContext) => void | Promise<void>): Promise<void> {
        await this.runTaskWithInit(this.constructTaskInit(), run);
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

    private async runTaskWithInit(
        init: TaskContextImpl.Init,
        run: (context: TaskContext) => void | Promise<void>
    ): Promise<void> {
        const context = this.addTaskWithInit(init).start();
        await run(context);
        context.finish();
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

    private constructTaskInitForWorkspace(workspace: Workspace): TaskContextImpl.Init {
        const prefix = wrapWorkspaceNameForPrefix(workspace.name).padEnd(
            wrapWorkspaceNameForPrefix("X".repeat(this.longestWorkspaceNameLength)).length
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const colorForWorkspace = WORKSPACE_NAME_COLORS[this.numTasks++ % WORKSPACE_NAME_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        return {
            ...this.constructTaskInit(),
            logPrefix: prefixWithColor,
        };
    }

    private constructTaskInit(): TaskContextImpl.Init {
        return {
            log: (content) => this.log(content),
            takeOverTerminal: (run) => this.ttyAwareLogger.takeOverTerminal(run),
            onFinish: (result) => {
                if (result === TaskResult.Failure) {
                    this.didSucceed = false;
                }
            },
        };
    }

    private log(logs: LogWithLevel[]): void {
        const formatted = logs
            .filter((log) => LOG_LEVELS.indexOf(log.level) >= LOG_LEVELS.indexOf(this.logLevel))
            .map(
                (log): Log => ({
                    omitOnTTY: log.omitOnTTY,
                    content: formatLog(log),
                })
            );
        this.ttyAwareLogger.log(formatted);
    }
}

function wrapWorkspaceNameForPrefix(workspaceName: string): string {
    return `[${workspaceName}]:`;
}

function formatLog(log: LogWithLevel): string {
    const trimmed = log.content.trim() + "\n";
    switch (log.level) {
        case LogLevel.Error:
            return chalk.red(trimmed);
        case LogLevel.Warn:
            return chalk.hex("FFA500")(trimmed);
        case LogLevel.Debug:
        case LogLevel.Info:
            return trimmed;
    }
}
