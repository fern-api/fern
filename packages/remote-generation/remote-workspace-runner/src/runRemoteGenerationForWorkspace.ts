import { WorkspaceDefinition } from "@fern-api/commons";
import { Compiler } from "@fern-api/compiler";
import { model, services } from "@fern-fern/fiddle-coordinator-api-client";
import { defaultFetcher } from "@fern-typescript/service-utils";
import axios from "axios";
import chalk from "chalk";
import FormData from "form-data";
import { createWriteStream } from "fs";

const REMOTE_GENERATION_SERVICE = new services.remoteGen.RemoteGenerationService({
    origin: "https://fiddle-coordinator-dev.buildwithfern.com/api",
    fetcher: defaultFetcher,
});

export async function runRemoteGenerationForWorkspace({
    org,
    workspaceDefinition,
    compileResult,
}: {
    org: string;
    workspaceDefinition: WorkspaceDefinition;
    compileResult: Compiler.SuccessfulResult;
}): Promise<void> {
    if (workspaceDefinition.generators.length === 0) {
        return;
    }

    const createResponse = await REMOTE_GENERATION_SERVICE.createJob({
        apiName: workspaceDefinition.name,
        orgName: org,
        generators: workspaceDefinition.generators.map((generator) => ({
            id: generator.name,
            version: generator.version,
            // TODO delete this cast
            customConfig: generator.config as Record<string, string>,
        })),
    });

    if (!createResponse.ok) {
        throw new Error("Job did not succeed");
    }
    const job = createResponse.body;

    const formData = new FormData();
    formData.append("file", JSON.stringify(compileResult.intermediateRepresentation));
    await axios.post(
        `https://fiddle-coordinator-dev.buildwithfern.com/api/remote-gen/jobs/${job.jobId}/start`,
        formData,
        {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
        }
    );

    return new Promise((resolve) => {
        console.log("Running generators...");

        let statuses: Record<model.remoteGen.RemoteGenTaskId, model.remoteGen.TaskStatus> = {};

        const handledTaskIds = new Set<model.remoteGen.RemoteGenTaskId>();

        setTimeout(getStatus, 2_000);
        async function getStatus() {
            const response = await REMOTE_GENERATION_SERVICE.getJobStatus({
                jobId: job.jobId,
            }).catch((e) => {
                console.error("Failed to get job status", e);
                throw e;
            });

            if (response.ok) {
                statuses = response.body;
                job.taskIds.forEach(async (taskId, index) => {
                    if (handledTaskIds.has(taskId)) {
                        return;
                    }
                    const status = statuses[taskId];
                    const generator = workspaceDefinition.generators[index];
                    if (generator == null || status == null) {
                        return;
                    }
                    if (status._type === "finished") {
                        handledTaskIds.add(taskId);
                        for (const publishedPackage of status.publishedPackages) {
                            if (publishedPackage._type === "npm") {
                                console.log(
                                    `Published ${chalk.bold(`${publishedPackage.name}@${publishedPackage.version}`)}`
                                );
                            } else if (publishedPackage._type === "maven") {
                                console.log(
                                    `Published ${chalk.bold(
                                        `${publishedPackage.group}:${publishedPackage.artifact}:${publishedPackage.version}`
                                    )}`
                                );
                            }
                        }
                        if (status.hasFilesToDownload && generator.generate?.absolutePathToLocalOutput != null) {
                            const { absolutePathToLocalOutput } = generator.generate;
                            const writer = createWriteStream(absolutePathToLocalOutput);
                            await axios
                                .get(
                                    `https://fiddle-coordinator-dev.buildwithfern.com/api/remote-gen/tasks/${taskId}/jobs/${job.jobId}/downloadFiles`,
                                    { responseType: "stream" }
                                )
                                .then((response) => {
                                    response.data.pipe(writer);
                                    console.log(
                                        "Downloaded Postman collection to: " + chalk.bold(absolutePathToLocalOutput)
                                    );
                                })
                                .catch((error) => {
                                    console.error("Failed to download Postman collection.", error);
                                });
                        }
                    } else if (status._type === "failed") {
                        console.log("Failed to generate :(");
                    }
                });
                if (Object.values(statuses).every(isStatusComplete)) {
                    resolve();
                    return;
                }
            } else {
                console.log(chalk.red("Failed to load job status"));
            }

            setTimeout(getStatus, 3_000);
        }
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
