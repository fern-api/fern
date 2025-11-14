import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export declare namespace runContainer {
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

export async function runContainer({
    logger,
    imageName,
    args = [],
    binds = [],
    envVars = {},
    ports = {},
    writeLogsToFile = true,
    removeAfterCompletion = false,
    runner
}: runContainer.Args): Promise<void> {
    const tryRun = () =>
        tryRunContainer({
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
            await pullImage(imageName, runner);
            await tryRun();
        } else {
            throw e;
        }
    }
}

/**
 * @deprecated Use runContainer instead. This function is maintained for backward compatibility.
 */
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

/**
 * @deprecated Use runContainer instead. This function is maintained for backward compatibility.
 */
export const runDocker = runContainer;

async function tryRunContainer({
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
    const containerArgs = [
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

    const containerRunner = runner ?? "docker";
    const { stdout, stderr, exitCode } = await loggingExeca(logger, containerRunner, containerArgs, {
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

    if (exitCode == null) {
        throw new Error(
            `Container runtime '${containerRunner}' is not installed or not found on PATH.\n` +
                `${containerRunner === "podman" ? "Seed tests default to Podman. " : ""}` +
                `Install ${containerRunner}: ${containerRunner === "podman" ? "https://podman.io/docs/installation" : "https://docs.docker.com/get-docker/"}\n` +
                `Error details: ${stderr || stdout || "No output"}`
        );
    }

    if (exitCode !== 0) {
        throw new Error(`Container exited with code ${exitCode}.\n${stdout}\n${stderr}`);
    }
}

async function pullImage(imageName: string, runner?: ContainerRunner): Promise<void> {
    await loggingExeca(undefined, runner ?? "docker", ["pull", imageName], {
        all: true,
        doNotPipeOutput: true
    });
}
