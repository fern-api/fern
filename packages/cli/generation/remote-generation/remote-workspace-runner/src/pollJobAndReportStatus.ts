import { entries } from "@fern-api/core-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { Fiddle } from "@fern-fern/fiddle-client";
import { RemoteTaskHandler } from "./RemoteTaskHandler";
import { REMOTE_GENERATION_SERVICE } from "./service";

const MAX_UNSUCCESSFUL_ATTEMPTS = 3;

export function pollJobAndReportStatus({
    job,
    generatorInvocations,
    context,
}: {
    job: Fiddle.remoteGen.CreateJobResponse;
    generatorInvocations: GeneratorInvocation[];
    context: TaskContext;
}): Promise<void> {
    let numConsecutiveFailed = 0;
    const taskHandlers = job.taskIds.reduce<Record<Fiddle.remoteGen.RemoteGenTaskId, RemoteTaskHandler>>(
        (acc, taskId, index) => {
            const generatorInvocation = generatorInvocations[index];
            if (generatorInvocation == null) {
                context.fail("Task IDs list is longer than generators list.");
            } else {
                const interactiveTaskContext = context
                    .addInteractiveTask({
                        name: generatorInvocation.name,
                    })
                    .start();
                interactiveTaskContext.logger.debug(`Task ID: ${taskId}`);
                acc[taskId] = new RemoteTaskHandler({
                    job,
                    taskId,
                    generatorInvocation,
                    interactiveTaskContext,
                });
            }
            return acc;
        },
        {}
    );

    return new Promise((resolve) => {
        void pollForStatus();

        async function pollForStatus() {
            const taskStatuses = await fetchTaskStatuses(job, context);
            context.logger.debug("Received status update: " + JSON.stringify(taskStatuses));
            if (taskStatuses == null) {
                numConsecutiveFailed++;
                if (numConsecutiveFailed === MAX_UNSUCCESSFUL_ATTEMPTS) {
                    context.fail(`Failed to get job status after ${numConsecutiveFailed} attempts.`);
                    return resolve();
                }
            } else {
                numConsecutiveFailed = 0;
                for (const [taskId, taskUpdate] of entries(taskStatuses)) {
                    taskHandlers[taskId]?.processUpdate(taskUpdate);
                }
                const allFinished = Object.values(taskHandlers).every((taskHandler) => taskHandler.isFinished());
                if (allFinished) {
                    return resolve();
                }
            }

            setTimeout(pollForStatus, 2_000);
        }
    });
}

async function fetchTaskStatuses(job: Fiddle.remoteGen.CreateJobResponse, context: TaskContext) {
    const response = await REMOTE_GENERATION_SERVICE.remoteGen.getJobStatus({
        jobId: job.jobId,
    });
    if (response.ok) {
        return response.body;
    } else {
        context.logger.warn("Failed to get job status.", response.error.content);
        return undefined;
    }
}
