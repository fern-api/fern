import { AbsoluteFilePath } from "@fern-api/core-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import {
    CreateJobResponse,
    RemoteGenJobId,
    RemoteGenTaskId,
    Task,
} from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import axios, { AxiosError } from "axios";
import chalk from "chalk";
import { createWriteStream } from "fs";
import urlJoin from "url-join";
import { FIDDLE_API_URL } from "./service";

export async function processFinishedTask({
    job,
    taskId,
    task,
    generatorInvocation,
}: {
    job: CreateJobResponse;
    taskId: RemoteGenTaskId;
    task: Task;
    generatorInvocation: GeneratorInvocation;
}): Promise<void> {
    if (
        task.status._type === "finished" &&
        task.status.hasFilesToDownload &&
        generatorInvocation.generate?.absolutePathToLocalOutput != null
    ) {
        try {
            await downloadFilesForTask({
                jobId: job.jobId,
                taskId,
                absolutePathToLocalOutput: generatorInvocation.generate.absolutePathToLocalOutput,
            });
        } catch {}
    }
}

async function downloadFilesForTask({
    jobId,
    taskId,
    absolutePathToLocalOutput,
}: {
    jobId: RemoteGenJobId;
    taskId: RemoteGenTaskId;
    absolutePathToLocalOutput: AbsoluteFilePath;
}) {
    const writer = createWriteStream(absolutePathToLocalOutput);
    await axios
        .get(urlJoin(FIDDLE_API_URL, `/remote-gen/tasks/${taskId}/jobs/${jobId}/downloadFiles`), {
            responseType: "stream",
        })
        .then((response) => {
            response.data.pipe(writer);
            console.log("Downloaded Postman collection to: " + chalk.bold(absolutePathToLocalOutput));
        })
        .catch((error) => {
            console.error(
                "Failed to download.",
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (error as AxiosError).message ?? "<unknown error>"
            );
        });
}
