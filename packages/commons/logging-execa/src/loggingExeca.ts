import { Logger } from "@fern-api/logger";
import execa, { ExecaReturnValue } from "execa";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
        /** AbortSignal to kill the child process on timeout/bail/Ctrl+C */
        signal?: AbortSignal;
    }

    export type ReturnValue = ExecaReturnValue;
}

/**
 * Wire an AbortSignal to kill an execa child process.
 * When the signal aborts (e.g. on test timeout or Ctrl+C), the child
 * process is terminated so it doesn't leak.
 */
function wireSignal(childProcess: import("execa").ExecaChildProcess, signal?: AbortSignal): void {
    if (!signal) {
        return;
    }
    // Proactively swallow any kill-related rejection so that neither
    // signal-triggered kills nor manual `.kill()` calls surface as
    // unhandled rejections in Vitest.
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentionally swallow rejection
    childProcess.catch(() => {});

    if (signal.aborted) {
        childProcess.kill();
        return;
    }
    const onAbort = (): void => {
        childProcess.kill();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    // biome-ignore lint/suspicious/noEmptyBlockStatements: swallow rejection from .finally() chain
    void childProcess.finally(() => signal.removeEventListener("abort", onAbort)).catch(() => {});
}

// returns the current command being run by execa
export function runExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, signal, ...execaOptions }: loggingExeca.Options = {}
): import("execa").ExecaChildProcess {
    const allSubstitutions = secrets.reduce(
        (acc, secret) => ({
            ...acc,
            [secret]: "<redacted>"
        }),
        substitutions
    );

    let logLine = [executable, ...args].join(" ");
    for (const [substitutionKey, substitutionValue] of Object.entries(allSubstitutions)) {
        logLine = logLine.replaceAll(substitutionKey, substitutionValue);
    }

    logger?.debug(`+ ${logLine}`);
    const childProcess = execa(executable, args, execaOptions);
    wireSignal(childProcess, signal);
    return childProcess;
}

// finishes executing the command and returns the result
export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, signal, ...execaOptions }: loggingExeca.Options = {}
): Promise<loggingExeca.ReturnValue> {
    const command = runExeca(logger, executable, args, {
        doNotPipeOutput,
        secrets,
        substitutions,
        signal,
        ...execaOptions
    });
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    const result = await command;
    if (result.stdout == null) {
        result.stdout = "";
    }
    if (result.stderr == null) {
        result.stderr = "";
    }
    return result;
}
