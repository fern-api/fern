import axios from "axios";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import { pipeline } from "stream/promises";

import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { InteractiveTaskContext } from "@fern-api/task-context";

export async function downloadSnippetsForTask({
    snippetsS3PreSignedReadUrl,
    absolutePathToLocalSnippetJSON,
    context
}: {
    snippetsS3PreSignedReadUrl: string;
    absolutePathToLocalSnippetJSON: AbsoluteFilePath;
    context: InteractiveTaskContext;
}): Promise<void> {
    try {
        await downloadFileForTask({
            s3PreSignedReadUrl: snippetsS3PreSignedReadUrl,
            absolutePathToLocalOutput: absolutePathToLocalSnippetJSON
        });
        context.logger.info(chalk.green(`Downloaded to ${absolutePathToLocalSnippetJSON}`));
    } catch (e) {
        context.logger.debug(chalk.yellow("Failed to download snippet.json from output."));
    }
}

async function downloadFileForTask({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
}): Promise<void> {
    const request = await axios.get(s3PreSignedReadUrl, {
        responseType: "stream"
    });
    if (await doesPathExist(absolutePathToLocalOutput)) {
        await rm(absolutePathToLocalOutput, { recursive: true });
    }
    await mkdir(dirname(absolutePathToLocalOutput), { recursive: true });
    await pipeline(request.data, createWriteStream(absolutePathToLocalOutput));
}
