import { entries } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { CreateJobResponse, RemoteGenTaskId } from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import { RemoteTaskHandler } from "./RemoteTaskHandler";
import { REMOTE_GENERATION_SERVICE } from "./service";

const MAX_UNSUCCESSFUL_ATTEMPTS = 3;

export function pollJobAndReportStatus({
    job,
    workspace,
    context,
}: {
    job: CreateJobResponse;
    workspace: Workspace;
    context: TaskContext;
}): Promise<void> {
    let numConsecutiveFailed = 0;
    const taskHandlers = job.taskIds.reduce<Record<RemoteGenTaskId, RemoteTaskHandler>>((acc, taskId, index) => {
        const generatorInvocation = workspace.generatorsConfiguration.generators[index];
        if (generatorInvocation == null) {
            context.logger.error("Task IDs list is longer than generators list.");
            context.fail();
        } else {
            acc[taskId] = new RemoteTaskHandler({
                job,
                taskId,
                generatorInvocation,
                interactiveTaskContext: context.addInteractiveTask({
                    name: generatorInvocation.name,
                }),
            });
        }
        return acc;
    }, {});

    return new Promise((resolve) => {
        void pollForStatus();

        async function pollForStatus() {
            const response = await fetchJobStatus(job);
            if (response == null || !response.ok) {
                numConsecutiveFailed++;
                if (numConsecutiveFailed === MAX_UNSUCCESSFUL_ATTEMPTS) {
                    context.logger.error("Failed to poll task status.");
                    context.fail();
                    return resolve();
                }
            } else {
                for (const [taskId, taskUpdate] of entries(response.body)) {
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

async function fetchJobStatus(job: CreateJobResponse) {
    try {
        return await REMOTE_GENERATION_SERVICE.getJobStatus({
            jobId: job.jobId,
        });
    } catch (error) {
        return undefined;
    }
}
