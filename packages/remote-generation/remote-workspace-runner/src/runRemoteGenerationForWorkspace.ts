import { WorkspaceDefinition } from "@fern-api/commons";
import { Compiler } from "@fern-api/compiler";
import { model, services } from "@fern-fern/fiddle-coordinator-api-client";
import chalk from "chalk";
import logUpdate from "log-update";
import ora from "ora";

const REMOTE_GENERATION_SERVICE = new services.remoteGen.RemoteGenerationService({
    origin: "https://fiddle-coordinator-dev.buildwithfern.com/api",
});

export async function runRemoteGenerationForWorkspace({
    workspaceDefinition,
    compileResult,
}: {
    workspaceDefinition: WorkspaceDefinition;
    compileResult: Compiler.SuccessfulResult;
}): Promise<void> {
    if (workspaceDefinition.generators.length === 0) {
        return;
    }

    const response = await REMOTE_GENERATION_SERVICE.createJob({
        apiName: workspaceDefinition.name,
        orgName: "fern-fern",
        generators: workspaceDefinition.generators.map((generator) => ({
            id: generator.name,
            version: generator.version,
            // TODO delete this case
            customConfig: generator.config as Record<string, string>,
        })),
    });

    if (!response.ok) {
        throw new Error("Job did not succeed");
    }
    const job = response.body;

    const formData = new FormData();
    formData.append("file", JSON.stringify(compileResult.intermediateRepresentation));
    await fetch(`https://fiddle-coordinator-dev.buildwithfern.com/api/remote-gen/jobs/${job.jobId}/start`, {
        body: formData,
    });

    return new Promise((resolve) => {
        const spinners = job.taskIds.map(() => ora().start());
        let statuses: Record<model.remoteGen.RemoteGenTaskId, model.remoteGen.TaskStatus> = {};

        void getStatus();
        async function getStatus() {
            const response = await REMOTE_GENERATION_SERVICE.getJobStatus({
                jobId: job.jobId,
            });

            if (response.ok) {
                statuses = response.body;
                job.taskIds.forEach((taskId, index) => {
                    const status = statuses[taskId];
                    const spinner = spinners[index];
                    if (status == null || spinner == null) {
                        return;
                    }
                    if (status._type === "finished") {
                        spinner.succeed();
                    } else if (status._type === "failed") {
                        spinner.fail();
                    }
                });
                if (Object.values(statuses).every(isStatusComplete)) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
            } else {
                console.log(chalk.red("Failed to load job status"));
            }

            setTimeout(getStatus, 3_000);
        }

        const interval = setInterval(() => {
            logUpdate(
                job.taskIds
                    .map((taskId, index) => {
                        const generator = workspaceDefinition.generators[index];
                        const spinner = spinners[index];
                        if (generator == null || spinner == null) {
                            return "";
                        }

                        const status = statuses[taskId];
                        spinner.text = `${chalk.bold(generator.name)}\t${getStatusAsText(status)}`;
                        return spinner.frame();
                    })
                    .join("\n")
            );
        }, 250);
    });
}

function isStatusComplete(status: model.remoteGen.TaskStatus | undefined): boolean {
    if (status == null) {
        return false;
    }
    return model.remoteGen.TaskStatus._visit(status, {
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

const NOT_STARTED_TEXT = "Preparing...";
function getStatusAsText(status: model.remoteGen.TaskStatus | undefined): string {
    if (status == null) {
        return NOT_STARTED_TEXT;
    }
    return model.remoteGen.TaskStatus._visit(status, {
        notStarted: () => NOT_STARTED_TEXT,
        running: () => "Running...",
        finished: () => "Finished!",
        failed: () => "Failed :(",
        _unknown: () => status._type,
    });
}
