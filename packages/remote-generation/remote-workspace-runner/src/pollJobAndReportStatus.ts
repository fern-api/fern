import { WorkspaceDefinition } from "@fern-api/commons";
import { CreateJobResponse, RemoteGenTaskId, Task, TaskStatus } from "@fern-fern/fiddle-coordinator-api-client/model";
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
    job: CreateJobResponse;
    workspaceDefinition: WorkspaceDefinition;
}): Promise<void> {
    const generatorInvocationsWithTaskIds: GeneratorInvocationWithTaskId[] = workspaceDefinition.generators.map(
        (generatorInvocation, index) => ({
            generatorInvocation,
            taskId: job.taskIds[index],
        })
    );

    let numConsecutiveFailed = 0;
    let lastSuccessfulTasks: Record<RemoteGenTaskId, Task>;
    const processedTasks = new Set<RemoteGenTaskId>();

    function logJobStatus() {
        logUpdate(getLogForTaskStatuses({ tasks: lastSuccessfulTasks, generatorInvocationsWithTaskIds }));
    }
    const logInterval = setInterval(logJobStatus, getSpinnerInterval());

    return new Promise((resolve, reject) => {
        void pollForStatus();

        async function pollForStatus() {
            const response = await fetchJobStatus(job);
            if (response?.ok) {
                lastSuccessfulTasks = response.body;
            } else {
                numConsecutiveFailed++;
            }

            if (numConsecutiveFailed === MAX_UNSUCCESSFUL_ATTEMPTS) {
                clearInterval(logInterval);
                reject();
            } else if (response?.ok) {
                let someTaskIsRunning = false;
                for (const [taskIdStr, task] of Object.entries(response.body)) {
                    const taskId = RemoteGenTaskId.of(taskIdStr);

                    // if a task just finished, process it
                    if (!processedTasks.has(taskId) && task.status._type === "finished") {
                        processedTasks.add(taskId);
                        const generatorInvocation = generatorInvocationsWithTaskIds.find(
                            (generatorInvocationWithTaskId) => generatorInvocationWithTaskId.taskId === taskId
                        )?.generatorInvocation;
                        if (generatorInvocation != null) {
                            // kick off, but don't await
                            void processFinishedTask({ job, taskId, task, generatorInvocation });
                        }
                    }

                    someTaskIsRunning ||= !isStatusComplete(task);
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

async function fetchJobStatus(job: CreateJobResponse) {
    try {
        return await REMOTE_GENERATION_SERVICE.getJobStatus({
            jobId: job.jobId,
        });
    } catch (error) {
        // TODO pass this through? or maybe fern should never throw
        return undefined;
    }
}

function isStatusComplete(task: Task | undefined): boolean {
    if (task == null) {
        return false;
    }
    return TaskStatus._visit(task.status, {
        notStarted: () => false,
        running: () => false,
        finished: () => true,
        failed: () => true,
        _unknown: () => true,
    });
}

function getSpinnerInterval() {
    if (typeof SPINNER.spinner !== "string" && SPINNER.spinner.interval != null) {
        return SPINNER.spinner.interval;
    } else {
        return 100;
    }
}
