import { WorkspaceDefinition } from "@fern-api/commons";
import {
    CreateJobResponseBody,
    RemoteGenTaskId,
    TaskStatus,
} from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import chalk from "chalk";
import logUpdate from "log-update";
import { getLogForTaskStatuses } from "./getLogForTaskStatus";
import { processFinishedTask } from "./processFinishedTask";
import { REMOTE_GENERATION_SERVICE } from "./service";
import { SPINNER } from "./spinner";
import { GeneratorInvocationWithTaskId } from "./types";

const MAX_UNSUCCESSFUL_ATTEMPTS = 3;

export function pollJobAndReportStatus({
    job,
    workspaceDefinition,
}: {
    job: CreateJobResponseBody;
    workspaceDefinition: WorkspaceDefinition;
}): Promise<void> {
    const generatorInvocationsWithTaskIds: GeneratorInvocationWithTaskId[] = workspaceDefinition.generators.map(
        (generatorInvocation, index) => ({
            generatorInvocation,
            taskId: job.taskIds[index],
        })
    );

    let numConsecutiveFailed = 0;
    let lastSuccessfulTaskStatuses: Record<RemoteGenTaskId, TaskStatus>;
    const processedTasks = new Set<RemoteGenTaskId>();

    function logJobStatus() {
        logUpdate(getLogForTaskStatuses({ statuses: lastSuccessfulTaskStatuses, generatorInvocationsWithTaskIds }));
    }
    const logInterval = setInterval(logJobStatus, SPINNER.interval);

    return new Promise((resolve, reject) => {
        void pollForStatus();

        async function pollForStatus() {
            const response = await fetchJobStatus(job);
            if (response?.ok) {
                lastSuccessfulTaskStatuses = response.body;
            } else {
                numConsecutiveFailed++;
            }

            if (numConsecutiveFailed === MAX_UNSUCCESSFUL_ATTEMPTS) {
                clearInterval(logInterval);
                reject();
            } else if (response?.ok) {
                let someTaskIsRunning = false;
                for (const [taskIdStr, taskStatus] of Object.entries(response.body)) {
                    const taskId = RemoteGenTaskId.of(taskIdStr);

                    // if a task just finished, process it
                    if (!processedTasks.has(taskId) && taskStatus._type === "finished") {
                        processedTasks.add(taskId);
                        const generatorInvocation = generatorInvocationsWithTaskIds.find(
                            (generatorInvocationWithTaskId) => generatorInvocationWithTaskId.taskId === taskId
                        )?.generatorInvocation;
                        if (generatorInvocation != null) {
                            // kick off, but don't await
                            void processFinishedTask({ job, taskId, taskStatus, generatorInvocation });
                        }
                    }

                    someTaskIsRunning ||= !isStatusComplete(taskStatus);
                }

                if (!someTaskIsRunning) {
                    clearInterval(logInterval);
                    logJobStatus();
                    resolve();
                } else {
                    setTimeout(pollForStatus, 2_000);
                }
            }
        }
    });
}

async function fetchJobStatus(job: CreateJobResponseBody) {
    try {
        return await REMOTE_GENERATION_SERVICE.getJobStatus({
            jobId: job.jobId,
        });
    } catch (error) {
        // TODO pass this through? or maybe fern should never throw
        return undefined;
    }
}

function isStatusComplete(status: TaskStatus | undefined): boolean {
    if (status == null) {
        return false;
    }
    return TaskStatus._visit(status, {
        notStarted: () => false,
        running: () => false,
        finished: () => true,
        failed: () => true,
        _unknown: () => {
            console.log(chalk.red("Unknown status", status._type));
            return true;
        },
    });
}
