import { CONSOLE_LOGGER, Logger } from "@fern-api/logger";
import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import { ExecaChildProcess, Options } from "execa";
import path from "path";

/**
 * Wire an AbortSignal to kill an execa child process.
 * When the signal aborts (e.g. on test timeout or Ctrl+C), the child
 * process is terminated so it doesn't leak.
 */
function wireSignal(childProcess: ExecaChildProcess, signal?: AbortSignal): void {
    if (!signal) {
        return;
    }
    if (signal.aborted) {
        childProcess.kill();
        return;
    }
    const onAbort = (): void => {
        childProcess.kill();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    // biome-ignore lint/suspicious/noMisplacedFunctionDeclaration: cleanup needs access to onAbort
    void childProcess.finally(() => signal.removeEventListener("abort", onAbort));
}

export async function runFernCli(
    args: string[],
    options?: Options,
    includeAuthToken: boolean = true,
    signal?: AbortSignal
): Promise<loggingExeca.ReturnValue> {
    const env = {
        ...options?.env,
        ...(includeAuthToken ? { FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV } : {})
    };

    const childProcess = runExeca(
        CONSOLE_LOGGER,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...options,
            env,
            doNotPipeOutput: options?.reject === false
        }
    );
    wireSignal(childProcess, signal);

    if (!(options?.reject === false)) {
        childProcess.stdout?.pipe(process.stdout);
        childProcess.stderr?.pipe(process.stderr);
    }
    const result = await childProcess;
    if (result.stdout == null) {
        result.stdout = "";
    }
    if (result.stderr == null) {
        result.stderr = "";
    }
    return result;
}

export async function runFernCliWithoutAuthToken(
    args: string[],
    options?: Options,
    logger?: Logger,
    signal?: AbortSignal
): Promise<loggingExeca.ReturnValue> {
    return runFernCli(args, options, false, signal);
}

export function captureFernCli(
    args: string[],
    options?: Options,
    signal?: AbortSignal
): ExecaChildProcess {
    const childProcess = runExeca(
        CONSOLE_LOGGER,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...options,
            env: {
                ...options?.env,
                FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
            },
            doNotPipeOutput: options?.reject === false
        }
    );
    wireSignal(childProcess, signal);
    return childProcess;
}
