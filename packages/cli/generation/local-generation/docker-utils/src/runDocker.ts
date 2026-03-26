import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import crypto from "crypto";
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
        /** AbortSignal to kill the container process on timeout/bail/Ctrl+C */
        signal?: AbortSignal;
        /** tmpfs mounts to add to the container (e.g. ["/fern/output:rw,size=512m"]) */
        tmpfsMounts?: string[];
        /**
         * Paths to copy back from the container after it exits.
         * Each entry maps a container path to a host path.
         * This is needed when using tmpfs mounts, since tmpfs overlays bind mounts
         * and the host directory won't receive writes directly.
         */
        copyBackPaths?: Array<{ containerPath: string; hostPath: string }>;
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
    runner,
    signal,
    tmpfsMounts = [],
    copyBackPaths = []
}: runContainer.Args): Promise<void> {
    // When tmpfs + copyBack is used, we cannot use --rm because we need the container
    // to still exist after it exits so we can docker cp files out.
    const needsCopyBack = tmpfsMounts.length > 0 && copyBackPaths.length > 0;
    const effectiveRemoveAfterCompletion = needsCopyBack ? false : removeAfterCompletion;

    // Generate a unique container name when we need to reference the container after it exits
    const containerName = needsCopyBack ? `fern-gen-${crypto.randomUUID().slice(0, 8)}` : undefined;

    const tryRun = () =>
        tryRunContainer({
            logger,
            imageName,
            args,
            binds,
            envVars,
            ports,
            removeAfterCompletion: effectiveRemoveAfterCompletion,
            writeLogsToFile,
            runner,
            signal,
            tmpfsMounts,
            containerName
        });
    let containerId: string | undefined;
    try {
        containerId = await tryRun();
    } catch (e) {
        if (e instanceof Error && e.message.includes("No such image")) {
            await pullImage(imageName, runner, signal);
            try {
                containerId = await tryRun();
            } catch (retryError) {
                if (needsCopyBack && containerName != null && removeAfterCompletion) {
                    await stopContainer({ logger, containerId: containerName, runner });
                }
                throw retryError;
            }
        } else {
            // Clean up the named container that was started without --rm
            if (needsCopyBack && containerName != null && removeAfterCompletion) {
                await stopContainer({ logger, containerId: containerName, runner });
            }
            throw e;
        }
    }

    // Copy back files from the container if needed (tmpfs output)
    if (needsCopyBack && containerId != null) {
        try {
            for (const { containerPath, hostPath } of copyBackPaths) {
                await copyFromContainer({
                    logger,
                    containerId,
                    containerPath: `${containerPath}/.`,
                    hostPath,
                    runner
                });
            }
        } finally {
            // Clean up the container since we skipped --rm
            if (removeAfterCompletion) {
                await stopContainer({ logger, containerId, runner });
            }
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
        /** AbortSignal to kill the container process on timeout/bail/Ctrl+C */
        signal?: AbortSignal;
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
    runner,
    signal,
    tmpfsMounts = [],
    containerName
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
    signal?: AbortSignal;
    tmpfsMounts?: string[];
    containerName?: string;
}): Promise<string | undefined> {
    if (process.env["FERN_STACK_TRACK"]) {
        envVars["FERN_STACK_TRACK"] = process.env["FERN_STACK_TRACK"];
    }
    const containerArgs = [
        "run",
        "--user",
        "root",
        ...binds.flatMap((bind) => ["-v", bind]),
        ...tmpfsMounts.flatMap((mount) => ["--tmpfs", mount]),
        ...Object.entries(envVars).flatMap(([key, value]) => ["-e", `${key}=\"${value}\"`]),
        ...Object.entries(ports).flatMap(([hostPort, containerPort]) => ["-p", `${hostPort}:${containerPort}`]),
        removeAfterCompletion ? "--rm" : "",
        ...(containerName != null ? ["--name", containerName] : []),
        imageName,
        ...args
    ].filter(Boolean);

    const containerRunner = runner ?? "docker";
    const { stdout, stderr, exitCode } = await loggingExeca(logger, containerRunner, containerArgs, {
        reject: false,
        all: true,
        doNotPipeOutput: true,
        signal
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

    return containerName;
}

async function pullImage(imageName: string, runner?: ContainerRunner, signal?: AbortSignal): Promise<void> {
    await loggingExeca(undefined, runner ?? "docker", ["pull", imageName], {
        all: true,
        doNotPipeOutput: true,
        signal
    });
}

/**
 * Starts a long-lived container in detached mode for reuse across multiple executions.
 * Returns the container ID.
 */
export async function startContainer({
    logger,
    imageName,
    runner
}: {
    logger?: Logger;
    imageName: string;
    runner?: ContainerRunner;
}): Promise<string> {
    const containerRunner = runner ?? "docker";

    const tryStart = async () => {
        const { stdout, exitCode, stderr } = await loggingExeca(
            logger,
            containerRunner,
            ["run", "--user", "root", "-dit", "--entrypoint", "/bin/sh", imageName],
            {
                reject: false,
                doNotPipeOutput: true
            }
        );

        if (exitCode == null) {
            throw new Error(
                `Container runtime '${containerRunner}' is not installed or not found on PATH.\n` +
                    `Error details: ${stderr || stdout || "No output"}`
            );
        }

        if (exitCode !== 0) {
            throw new Error(`Failed to start container from image ${imageName}.\n${stdout}\n${stderr}`);
        }

        return stdout.trim();
    };

    try {
        return await tryStart();
    } catch (e) {
        if (e instanceof Error && e.message.includes("No such image")) {
            await pullImage(imageName, runner);
            return await tryStart();
        }
        throw e;
    }
}

/**
 * Executes a command inside a running container.
 */
export async function execInContainer({
    logger,
    containerId,
    command,
    runner,
    writeLogsToFile = true
}: {
    logger: Logger;
    containerId: string;
    command: string[];
    runner?: ContainerRunner;
    writeLogsToFile?: boolean;
}): Promise<void> {
    const containerRunner = runner ?? "docker";
    const { stdout, stderr, exitCode } = await loggingExeca(
        logger,
        containerRunner,
        ["exec", "--user", "root", containerId, ...command],
        {
            reject: false,
            all: true,
            doNotPipeOutput: true
        }
    );

    const logs = stdout + stderr;

    if (writeLogsToFile) {
        const tmpFile = await tmp.file();
        await writeFile(tmpFile.path, logs);
        logger.info(`Generator logs here: ${tmpFile.path}`);
    }

    if (exitCode !== 0) {
        throw new Error(`Container exec exited with code ${exitCode}.\n${stdout}\n${stderr}`);
    }
}

/**
 * Copies a file or directory into a running container.
 */
export async function copyToContainer({
    logger,
    containerId,
    hostPath,
    containerPath,
    runner
}: {
    logger: Logger;
    containerId: string;
    hostPath: string;
    containerPath: string;
    runner?: ContainerRunner;
}): Promise<void> {
    const containerRunner = runner ?? "docker";
    const { exitCode, stdout, stderr } = await loggingExeca(
        logger,
        containerRunner,
        ["cp", hostPath, `${containerId}:${containerPath}`],
        {
            reject: false,
            doNotPipeOutput: true
        }
    );

    if (exitCode !== 0) {
        throw new Error(
            `Failed to copy ${hostPath} to container ${containerId}:${containerPath}.\n${stdout}\n${stderr}`
        );
    }
}

/**
 * Copies a file or directory from a running container to the host.
 */
export async function copyFromContainer({
    logger,
    containerId,
    containerPath,
    hostPath,
    runner
}: {
    logger: Logger;
    containerId: string;
    containerPath: string;
    hostPath: string;
    runner?: ContainerRunner;
}): Promise<void> {
    const containerRunner = runner ?? "docker";
    const { exitCode, stdout, stderr } = await loggingExeca(
        logger,
        containerRunner,
        ["cp", `${containerId}:${containerPath}`, hostPath],
        {
            reject: false,
            doNotPipeOutput: true
        }
    );

    if (exitCode !== 0) {
        throw new Error(`Failed to copy ${containerId}:${containerPath} to ${hostPath}.\n${stdout}\n${stderr}`);
    }
}

/**
 * Stops and removes a running container.
 */
export async function stopContainer({
    logger,
    containerId,
    runner
}: {
    logger?: Logger;
    containerId: string;
    runner?: ContainerRunner;
}): Promise<void> {
    const containerRunner = runner ?? "docker";
    await loggingExeca(logger, containerRunner, ["rm", "-f", containerId], {
        reject: false,
        doNotPipeOutput: true
    });
}
