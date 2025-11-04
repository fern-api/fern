import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export declare namespace runDocker {
    export interface Args {
        logger: Logger;
        imageName: string;
        args?: string[];
        binds?: string[];
        envVars?: Record<string, string>;
        ports?: Record<string, string>;
        writeLogsToFile?: boolean;
        removeAfterCompletion?: boolean;
        runner?: ContainerRunner;
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
    envVars = {},
    ports = {},
    writeLogsToFile = true,
    removeAfterCompletion = false,
    runner
}: runDocker.Args): Promise<void> {
    const tryRun = () =>
        tryRunDocker({
            logger,
            imageName,
            args,
            binds,
            envVars,
            ports,
            removeAfterCompletion,
            writeLogsToFile,
            runner
        });
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
    envVars = {},
    ports = {},
    removeAfterCompletion,
    writeLogsToFile,
    runner
}: {
    logger: Logger;
    imageName: string;
    args: string[];
    binds: string[];
    envVars?: Record<string, string>;
    ports?: Record<string, string>;
    removeAfterCompletion: boolean;
    writeLogsToFile: boolean;
    runner?: ContainerRunner;
}): Promise<void> {
    if (process.env["FERN_STACK_TRACK"]) {
        envVars["FERN_STACK_TRACK"] = process.env["FERN_STACK_TRACK"];
    }
    const dockerArgs = [
        "run",
        "--user",
        "root",
        ...binds.flatMap((bind) => ["-v", bind]),
        ...Object.entries(envVars).flatMap(([key, value]) => ["-e", `${key}=\"${value}\"`]),
        ...Object.entries(ports).flatMap(([hostPort, containerPort]) => ["-p", `${hostPort}:${containerPort}`]),
        removeAfterCompletion ? "--rm" : "",
        imageName,
        ...args
    ].filter(Boolean);
    // This filters out any falsy values (empty strings, null, undefined) from the dockerArgs array
    // In this case, it removes empty strings that may be present when removeAfterCompletion is false

    const { stdout, stderr, exitCode } = await loggingExeca(logger, runner ?? "docker", dockerArgs, {
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
