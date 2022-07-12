import { GeneratorInvocation } from "@fern-api/commons";
import {
    PublishedPackage,
    RemoteGenTaskId,
    TaskStatus,
} from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import chalk from "chalk";
import { SPINNER } from "./spinner";
import { GeneratorInvocationWithTaskId } from "./types";

export function getLogForTaskStatuses({
    statuses,
    generatorInvocationsWithTaskIds,
}: {
    statuses: Record<RemoteGenTaskId, TaskStatus> | undefined;
    generatorInvocationsWithTaskIds: readonly GeneratorInvocationWithTaskId[];
}): string {
    const spinnerFrame = SPINNER.frame();
    return generatorInvocationsWithTaskIds
        .map(
            ({ generatorInvocation, taskId }) =>
                "\n" +
                getLogForTaskStatus({
                    generatorInvocation,
                    status: taskId != null ? statuses?.[taskId] : undefined,
                    spinnerFrame,
                }).join("\n") +
                "\n"
        )
        .join("");
}

function getLogForTaskStatus({
    generatorInvocation,
    status,
    spinnerFrame,
}: {
    generatorInvocation: GeneratorInvocation;
    status: TaskStatus | undefined;
    spinnerFrame: string;
}): string[] {
    if (status == null) {
        status = TaskStatus.notStarted();
    }

    const icon = TaskStatus._visit(status, {
        notStarted: () => spinnerFrame,
        running: () => spinnerFrame,
        failed: () => "❌",
        finished: () => "✅",
        _unknown: () => "❓",
    });

    const text = TaskStatus._visit(status, {
        notStarted: () => "Queued",
        running: () => "Generating...",
        failed: () => "Failed",
        finished: () => "Succeeded",
        _unknown: () => "<Unknown status>",
    });

    const messages = [`${icon} ${chalk.bold(generatorInvocation.name)} ${chalk.gray(text)}`];

    if (status._type === "finished") {
        for (const publishedPackage of status.publishedPackages) {
            const coordinate = PublishedPackage._visit(publishedPackage, {
                npm: (npmPackage) => `${npmPackage.name}@${npmPackage.version}`,
                maven: (mavenPackage) => `${mavenPackage.group}:${mavenPackage.artifact}:${mavenPackage.version}`,
                _unknown: () => "<unknown package>",
            });
            messages.push(getSubLog(`✔️ Published: ${coordinate}`));
        }

        if (status.hasFilesToDownload && generatorInvocation.generate?.absolutePathToLocalOutput != null) {
            messages.push(getSubLog(`📁 Downloaded ${generatorInvocation.generate.absolutePathToLocalOutput}`));
        }
    }

    return messages;
}

function getSubLog(text: string) {
    return `  ${text}`;
}
