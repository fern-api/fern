import { GeneratorInvocation } from "@fern-api/commons";
import {
    Package,
    PackageCoordinate,
    PackagePublishStatus,
    RemoteGenTaskId,
    Task,
    TaskStatus,
} from "@fern-fern/fiddle-coordinator-api-client/model";
import chalk from "chalk";
import { SPINNER } from "./spinner";
import { GeneratorInvocationWithTaskId } from "./types";

const DEFAULT_TASK_STATUS = TaskStatus.notStarted();

export function getLogForTaskStatuses({
    tasks,
    generatorInvocationsWithTaskIds,
}: {
    tasks: Record<RemoteGenTaskId, Task> | undefined;
    generatorInvocationsWithTaskIds: readonly GeneratorInvocationWithTaskId[];
}): string {
    return generatorInvocationsWithTaskIds
        .map(
            ({ generatorInvocation, taskId }) =>
                "\n" +
                getLogForTaskStatus({
                    generatorInvocation,
                    task: taskId != null ? tasks?.[taskId] : undefined,
                }).join("\n") +
                "\n"
        )
        .join("");
}

function getLogForTaskStatus({
    generatorInvocation,
    task,
}: {
    generatorInvocation: GeneratorInvocation;
    task: Task | undefined;
}): string[] {
    const spinnerFrame = SPINNER.frame();

    const icon = TaskStatus._visit(task?.status ?? DEFAULT_TASK_STATUS, {
        notStarted: () => spinnerFrame,
        running: () => spinnerFrame,
        failed: () => "❌",
        finished: () => "✅",
        _unknown: () => "❓",
    });

    const title = getTitleForTask(task);
    const messages = [`${icon} ${chalk.bold(generatorInvocation.name)} ${chalk.gray(title)}`];

    if (task != null) {
        for (const packageForTask of task.packages) {
            const logForPackage = getLogForPackage({ packageForTask, spinnerFrame });
            messages.push(logForPackage);
        }

        if (
            task.status._type === "finished" &&
            task.status.hasFilesToDownload &&
            generatorInvocation.generate?.absolutePathToLocalOutput != null
        ) {
            messages.push(getSubLog(`📁 Downloaded ${generatorInvocation.generate.absolutePathToLocalOutput}`));
        }
    }

    return messages;
}

const QUEUED_TEXT = "Queued...";
function getTitleForTask(task: Task | undefined) {
    const lastLog = task != null ? task.logs[task.logs.length - 1]?.message : undefined;
    return TaskStatus._visit(task?.status ?? DEFAULT_TASK_STATUS, {
        notStarted: () => QUEUED_TEXT,
        running: () => lastLog ?? "Generating...",
        failed: (failed) => failed.message,
        finished: () => "Succeeded",
        _unknown: () => "<Unknown status>",
    });
}

function getLogForPackage({ packageForTask, spinnerFrame }: { packageForTask: Package; spinnerFrame: string }) {
    const icon = PackagePublishStatus._visit(packageForTask.status, {
        notStartedPublishing: () => "○",
        publishing: () => spinnerFrame,
        published: () => "✔️",
        failedToPublish: () => "❌",
        _unknown: () => "❓",
    });

    const coordinate = PackageCoordinate._visit(packageForTask.coordinate, {
        npm: (npmPackage) => `${npmPackage.name}@${npmPackage.version}`,
        maven: (mavenPackage) => `${mavenPackage.group}:${mavenPackage.artifact}:${mavenPackage.version}`,
        _unknown: () => "<unknown package>",
    });

    const logForPackage = getSubLog(`${icon} ${coordinate}`);
    return logForPackage;
}

function getSubLog(text: string) {
    return `  ${text}`;
}
