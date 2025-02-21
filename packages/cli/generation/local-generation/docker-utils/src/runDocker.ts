import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

export declare namespace runDocker {
    export interface Args {
        logger: Logger;
        imageName: string;
        args?: string[];
        binds?: string[];
        writeLogsToFile?: boolean;
        removeAfterCompletion?: boolean;
    }

    export interface Result {
        logs: string;
    }
}

export async function runDocker({
    logger,
    imageName,
    args = [],
    binds = [],
    writeLogsToFile = true,
    removeAfterCompletion = false
}: runDocker.Args): Promise<void> {
    const tryRun = () => tryRunDocker({ logger, imageName, args, binds, removeAfterCompletion, writeLogsToFile });
    try {
        await tryRun();
    } catch (e) {
        if (e instanceof Error && e.message.includes("No such image")) {
            await pullImage(imageName);
            await tryRun();
        } else {
            throw e;
        }
    }
}

async function tryRunDocker({
    logger,
    imageName,
    args,
    binds,
    removeAfterCompletion,
    writeLogsToFile
}: {
    logger: Logger;
    imageName: string;
    args: string[];
    binds: string[];
    removeAfterCompletion: boolean;
    writeLogsToFile: boolean;
}): Promise<void> {
    const dockerArgs = [
        "run",
        "--user",
        "root",
        ...binds.flatMap((bind) => ["-v", bind]),
        removeAfterCompletion ? "--rm" : "",
        imageName,
        ...args
    ].filter(Boolean);
    // This filters out any falsy values (empty strings, null, undefined) from the dockerArgs array
    // In this case, it removes empty strings that may be present when removeAfterCompletion is false

    const { stdout, stderr, exitCode } = await loggingExeca(logger, "docker", dockerArgs, {
        reject: false,
        all: true,
        doNotPipeOutput: true
    });

    const logs = stdout + stderr;

    if (writeLogsToFile) {
        const tmpFile = await tmp.file();
        await writeFile(tmpFile.path, logs);
        logger.info(`Generator logs here: ${tmpFile.path}`);
    }

    if (exitCode !== 0) {
        throw new Error(`Docker exited with code ${exitCode}.\n${stdout}\n${stderr}`);
    }
}

async function pullImage(imageName: string): Promise<void> {
    await loggingExeca(undefined, "docker", ["pull", imageName], {
        all: true,
        doNotPipeOutput: true
    });
}
