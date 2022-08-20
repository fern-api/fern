import { InteractiveTaskContext, TaskContext, TaskResult } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { CliEnvironment } from "./CliEnvironment";
import { InteractiveTaskContextImpl } from "./InteractiveTaskContextImpl";
import { InteractiveTasks } from "./InteractiveTasks";
import { getLogWithColor } from "./LogWithLevel";
import { TaskContextImpl } from "./TaskContextImpl";
import { getFernCliUpgradeMessage } from "./upgrade-utils/getFernCliUpgradeMessage";

const WORKSPACE_NAME_COLORS = ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#CCE2A3"];

export class CliContext {
    public readonly environment: CliEnvironment;

    public suppressUpgradeMessage = false;

    private didSucceed = false;

    private numTasks = 0;
    private interactiveTasks = new InteractiveTasks(process.stdout);

    constructor() {
        this.environment = {
            packageName: getPackageName(),
            packageVersion: getPackageVersion(),
            cliName: getCliName(),
        };
    }

    public async exit(): Promise<void> {
        if (!this.suppressUpgradeMessage) {
            const upgradeMessage = await getFernCliUpgradeMessage(this.environment);
            if (upgradeMessage != null) {
                console.log(upgradeMessage);
            }
        }
        process.exit(this.didSucceed ? 0 : 1);
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

    private async handleFinishedTask({
        workspace,
        task,
        result,
    }: {
        workspace: Workspace;
        task: TaskContextImpl;
        result: TaskResult;
    }): Promise<void> {
        if (result == TaskResult.Failure) {
            this.didSucceed = false;
        }
        const colorForWorkspace = WORKSPACE_NAME_COLORS[this.numTasks++ % WORKSPACE_NAME_COLORS.length]!;
        const prefix = chalk.hex(colorForWorkspace)(`[${workspace.name}]:`);
        const logStr = task
            .getLogs()
            .map((log) => {
                return [prefix, getLogWithColor(log)].join(" ");
            })
            .join("\n");
        this.interactiveTasks.prependAndRepaint(logStr);
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
