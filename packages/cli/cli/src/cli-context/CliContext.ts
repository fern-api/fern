import { InteractiveTaskContext, Logger, TaskContext, TaskResult } from "@fern-api/task-context";
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
        this.environment = {
            packageName: getPackageName(),
            packageVersion: getPackageVersion(),
            cliName: getCliName(),
        };
    }

    public fail(): this {
        this.didSucceed = false;
        return this;
    }

    public async failAndExit(): Promise<never> {
        this.fail();
        return this.exit();
    }

    public async exitIfFailed(): Promise<void> {
        if (!this.didSucceed) {
            await this.exit();
        }
    }

    public async exit(): Promise<never> {
        this.interactiveTasks.finish();
        if (!this.suppressUpgradeMessage) {
            const upgradeMessage = await getFernCliUpgradeMessage(this.environment);
            if (upgradeMessage != null) {
                console.log(upgradeMessage);
            }
        }
        process.exit(this.didSucceed ? 0 : 1);
    }

    private longestWorkspaceNameLength = 0;
    public registerWorkspaces(workspaces: readonly Workspace[]): void {
        this.longestWorkspaceNameLength = Math.max(...workspaces.map((workspace) => workspace.name.length));
    }

    public async runTaskForWorkspace(
        workspace: Workspace,
        run: (task: TaskContext) => TaskResult | Promise<TaskResult>
    ): Promise<void> {
        const task = new TaskContextImpl();
        const result = await run(task);
        await this.handleFinishedTask({ workspace, task, result });
    }

    public async runInteractiveTaskForWorkspace(
        workspace: Workspace,
        run: (task: InteractiveTaskContext) => TaskResult | Promise<TaskResult>
    ): Promise<void> {
        const task = new InteractiveTaskContextImpl({
            name: workspace.name,
            subtitle: undefined,
            depth: 0,
        });
        this.interactiveTasks.addTask(task);
        const result = await run(task);
        await this.handleFinishedTask({ workspace, task, result });
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

    private async handleFinishedTask({
        workspace,
        task,
        result,
    }: {
        workspace: Workspace;
        task: TaskContextImpl;
        result: TaskResult;
    }): Promise<void> {
        if (result === TaskResult.Failure) {
            this.didSucceed = false;
        }
        const prefix = wrapWorkspaceNameForPrefix(workspace.name).padEnd(
            wrapWorkspaceNameForPrefix("X".repeat(this.longestWorkspaceNameLength)).length
        );
        const colorForWorkspace = WORKSPACE_NAME_COLORS[this.numTasks++ % WORKSPACE_NAME_COLORS.length]!;
        const prefixWithColor = chalk.hex(colorForWorkspace)(prefix);
        const logStr = task
            .getLogs()
            .flatMap((log) => {
                return `${prefixWithColor}${log.content.replaceAll("\n", `\n${" ".repeat(prefix.length)}`)}`;
            })
            .join("\n");
        this.log(logStr + "\n");
    }

    private log(content: string): void {
        this.interactiveTasks.prependAndRepaint(content);
    }
}

function getPackageName() {
    if (process.env.CLI_PACKAGE_NAME == null) {
        throw new Error("CLI_PACKAGE_NAME is not defined");
    }
    return process.env.CLI_PACKAGE_NAME;
}

function getPackageVersion() {
    if (process.env.CLI_VERSION == null) {
        throw new Error("CLI_VERSION is not defined");
    }
    return process.env.CLI_VERSION;
}

function getCliName() {
    if (process.env.CLI_NAME == null) {
        throw new Error("CLI_NAME is not defined");
    }
    return process.env.CLI_NAME;
}

function wrapWorkspaceNameForPrefix(workspaceName: string): string {
    return `[${workspaceName}]: `;
}
