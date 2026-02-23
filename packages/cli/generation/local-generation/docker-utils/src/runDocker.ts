import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { runExeca } from "@fern-api/logging-execa";
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
    signal
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
            runner,
            signal
        });
    try {
        await tryRun();
    } catch (e) {
        if (e instanceof Error && e.message.includes("No such image")) {
            await pullImage(imageName, runner, signal);
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

/**
 * Wire an AbortSignal to kill an execa child process.
 * When the signal aborts (e.g. on test timeout or Ctrl+C), the child
 * process is terminated so it doesn't leak.
 */
type ChildProcess = ReturnType<typeof runExeca>;

function wireSignal(childProcess: ChildProcess, signal?: AbortSignal): void {
    if (!signal) {
        return;
    }
    // Swallow the rejection that execa emits when we intentionally kill the
    // process so it doesn't surface as an unhandled-rejection in Vitest.
    const swallowKill = (): void => {
        // biome-ignore lint/suspicious/noEmptyBlockStatements: intentionally swallow rejection
        childProcess.catch(() => {});
    };
    if (signal.aborted) {
        swallowKill();
        childProcess.kill();
        return;
    }
    const onAbort = (): void => {
        swallowKill();
        childProcess.kill();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    void childProcess.finally(() => signal.removeEventListener("abort", onAbort));
}

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
    signal
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
    const childProcess = runExeca(logger, containerRunner, containerArgs, {
        reject: false,
        all: true,
        doNotPipeOutput: true
    });
    wireSignal(childProcess, signal);
    const { stdout, stderr, exitCode } = await childProcess;

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

async function pullImage(imageName: string, runner?: ContainerRunner, signal?: AbortSignal): Promise<void> {
    const childProcess = runExeca(undefined, runner ?? "docker", ["pull", imageName], {
        all: true,
        doNotPipeOutput: true
    });
    wireSignal(childProcess, signal);
    await childProcess;
}
