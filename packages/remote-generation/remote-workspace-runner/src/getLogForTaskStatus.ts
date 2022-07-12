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

export function getLogForTaskStatuses({
    tasks,
    generatorInvocationsWithTaskIds,
}: {
    tasks: Record<RemoteGenTaskId, Task> | undefined;
    generatorInvocationsWithTaskIds: readonly GeneratorInvocationWithTaskId[];
}): string {
    const spinnerFrame = SPINNER.frame();
    return generatorInvocationsWithTaskIds
        .map(
            ({ generatorInvocation, taskId }) =>
                "\n" +
                getLogForTaskStatus({
                    generatorInvocation,
                    task: taskId != null ? tasks?.[taskId] : undefined,
                    spinnerFrame,
                }).join("\n") +
                "\n"
        )
        .join("");
}

function getLogForTaskStatus({
    generatorInvocation,
    task,
    spinnerFrame,
}: {
    generatorInvocation: GeneratorInvocation;
    task: Task | undefined;
    spinnerFrame: string;
}): string[] {
    const status = task?.status ?? TaskStatus.notStarted();

    const icon = TaskStatus._visit(status, {
        notStarted: () => spinnerFrame,
        running: () => spinnerFrame,
        failed: () => "❌",
        finished: () => "✅",
        _unknown: () => "❓",
    });

    const lastLog = task != null ? task.logs[task.logs.length - 1] : undefined;
    const text =
        lastLog ??
        TaskStatus._visit(status, {
            notStarted: () => "Queued",
            running: () => "Generating...",
            failed: () => "Failed",
            finished: () => "Succeeded",
            _unknown: () => "<Unknown status>",
        });

    const messages = [`${icon} ${chalk.bold(generatorInvocation.name)} ${chalk.gray(text)}`];

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
