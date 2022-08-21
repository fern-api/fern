import { Logger } from "@fern-api/logger";
import { InteractiveTaskContext, TaskContext, TaskResult } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { CliEnvironment } from "./CliEnvironment";
import { InteractiveTaskContextImpl } from "./InteractiveTaskContextImpl";
import { InteractiveTasks } from "./InteractiveTasks";
import { TaskContextImpl } from "./TaskContextImpl";
import { getFernCliUpgradeMessage } from "./upgrade-utils/getFernCliUpgradeMessage";

const WORKSPACE_NAME_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export class CliContext {
    public readonly environment: CliEnvironment;

    public suppressUpgradeMessage = false;

    private didSucceed = true;

    private numTasks = 0;
    private interactiveTasks = new InteractiveTasks(process.stdout);

    constructor() {
        const packageName = this.getPackageName();
        const packageVersion = this.getPackageVersion();
        const cliName = this.getCliName();
        if (packageName == null || packageVersion == null || cliName == null) {
            this.exit();
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

    public fail(): this {
        this.didSucceed = false;
        return this;
    }

    public async failAndExit(): Promise<never> {
        this.fail();
        return this.finish();
    }

    public async exitIfFailed(): Promise<void> {
        if (!this.didSucceed) {
            await this.finish();
        }
    }

    public async finish(): Promise<never> {
        this.interactiveTasks.finish();
        if (!this.suppressUpgradeMessage) {
            const upgradeMessage = await getFernCliUpgradeMessage(this.environment);
            if (upgradeMessage != null) {
                console.log(upgradeMessage);
            }
        }
        this.exit();
    }

    private exit(): never {
        process.exit(this.didSucceed ? 0 : 1);
    }

    private longestWorkspaceNameLength = 0;
    public registerWorkspaces(workspaces: readonly Workspace[]): void {
        this.longestWorkspaceNameLength = Math.max(...workspaces.map((workspace) => workspace.name.length));
    }

    public async runTask(run: (context: TaskContext) => void | Promise<void>): Promise<void> {
        const context = new TaskContextImpl({
            log: (content) => this.log(content),
        });
        await run(context);
        await this.handleFinishedTask(context);
    }

    public async runTaskForWorkspace(
        workspace: Workspace,
        run: (context: TaskContext) => void | Promise<void>
    ): Promise<void> {
        const context = new TaskContextImpl(this.constructTaskInitForWorkspace(workspace));
        await run(context);
        await this.handleFinishedTask(context);
    }

    public async runInteractiveTaskForWorkspace(
        workspace: Workspace,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<void> {
        const context = new InteractiveTaskContextImpl({
            ...this.constructTaskInitForWorkspace(workspace),
            name: workspace.name,
            subtitle: undefined,
            depth: 0,
        });
        this.interactiveTasks.addTask(context);
        await run(context);
        context.finish();
        await this.handleFinishedTask(context);
    }

    get logger(): Logger {
        return {
            debug: (content) => {
                this.log(content);
            },
            info: (content) => {
                this.log(content);
            },
            warn: (content) => {
                this.log(content);
            },
            error: (content) => {
                this.log(content);
            },
            log: (content) => {
                this.log(content);
            },
        };
    }

    private async handleFinishedTask(context: TaskContextImpl): Promise<void> {
        if (context.getResult() === TaskResult.Failure) {
            this.didSucceed = false;
        }
        context.printLogs();
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

    private log(content: string): void {
        if (content.length > 0 && !content.endsWith("\n")) {
            content += "\n";
        }
        this.interactiveTasks.repaint({
            contentAbove: content,
        });
    }
}

function wrapWorkspaceNameForPrefix(workspaceName: string): string {
    return `[${workspaceName}]: `;
}
