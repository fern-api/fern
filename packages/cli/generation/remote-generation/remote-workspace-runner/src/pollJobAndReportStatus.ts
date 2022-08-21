import { LogLevel } from "@fern-api/logger";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import {
    CreateJobResponse,
    LogLevel as FiddleLogLevel,
    RemoteGenTaskId,
} from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import { processFinishedTask } from "./processFinishedTask";
import { REMOTE_GENERATION_SERVICE } from "./service";
import { GeneratorInvocationWithTaskId } from "./types";

const MAX_UNSUCCESSFUL_ATTEMPTS = 3;

export function pollJobAndReportStatus({
    job,
    taskId,
    workspace,
    context,
}: {
    job: CreateJobResponse;
    taskId: RemoteGenTaskId;
    workspace: Workspace;
    context: InteractiveTaskContext;
}): Promise<void> {
    const generatorInvocationsWithTaskIds: GeneratorInvocationWithTaskId[] =
        workspace.generatorsConfiguration.generators.map((generatorInvocation, index) => ({
            generatorInvocation,
            taskId: job.taskIds[index],
        }));

    let numConsecutiveFailed = 0;
    let lengthOfLastLogs = 0;

    return new Promise((resolve) => {
        void pollForStatus();

        async function pollForStatus() {
            const response = await fetchJobStatus(job);
            if (response == null || !response.ok) {
                numConsecutiveFailed++;
            } else {
                const task = response.body[taskId];
                if (task == null) {
                    context.logger.error("Task is missing on job status");
                    context.fail();
                    return resolve();
                }

                for (const newLog of task.logs.slice(lengthOfLastLogs)) {
                    const level = FiddleLogLevel._visit(newLog.level, {
                        debug: () => LogLevel.Debug,
                        info: () => LogLevel.Info,
                        warn: () => LogLevel.Warn,
                        error: () => LogLevel.Error,
                        _unknown: () => LogLevel.Info,
                    });
                    context.logger.log(newLog.message, level);
                }
                lengthOfLastLogs = task.logs.length;

                switch (task.status._type) {
                    case "notStarted":
                    case "running":
                        break;
                    case "failed":
                        context.fail();
                        context.logger.error(task.status.message);
                        return resolve();
                    case "finished":
                    default: {
                        const generatorInvocation = generatorInvocationsWithTaskIds.find(
                            (generatorInvocationWithTaskId) => generatorInvocationWithTaskId.taskId === taskId
                        )?.generatorInvocation;
                        if (generatorInvocation != null) {
                            // kick off, but don't await
                            void processFinishedTask({ job, taskId, task, generatorInvocation });
                        }
                        return resolve();
                    }
                }
            }

            if (numConsecutiveFailed === MAX_UNSUCCESSFUL_ATTEMPTS) {
                context.logger.error("Failed to poll task status.");
                context.fail();
                return resolve();
            }

            setTimeout(pollForStatus, 2_000);
        }
    });
}

async function fetchJobStatus(job: CreateJobResponse) {
    try {
        return await REMOTE_GENERATION_SERVICE.getJobStatus({
            jobId: job.jobId,
        });
    } catch (error) {
        return undefined;
    }
}
