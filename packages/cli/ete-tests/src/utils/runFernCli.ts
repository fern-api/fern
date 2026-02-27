import { CONSOLE_LOGGER } from "@fern-api/logger";
import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import type { Options as ExecaOptions } from "execa";
import path from "path";

interface RunFernCliOptions extends ExecaOptions {
    /** Include the FERN_ORG_TOKEN_DEV auth token (default: true) */
    includeAuthToken?: boolean;
    /** AbortSignal from vitest test context for cleanup on timeout/bail/Ctrl+C */
    signal?: AbortSignal;
}

export async function runFernCli(
    args: string[],
    { includeAuthToken = true, signal, ...execaOptions }: RunFernCliOptions = {}
): Promise<loggingExeca.ReturnValue> {
    const env = {
        ...execaOptions?.env,
        ...(includeAuthToken ? { FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV } : {})
    };

    return loggingExeca(
        CONSOLE_LOGGER,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...execaOptions,
            env,
            doNotPipeOutput: execaOptions?.reject === false,
            signal
        }
    );
}

interface CaptureFernCliOptions extends ExecaOptions {
    /** AbortSignal from vitest test context for cleanup on timeout/bail/Ctrl+C */
    signal?: AbortSignal;
}

export function captureFernCli(
    args: string[],
    { signal, ...execaOptions }: CaptureFernCliOptions = {}
): ReturnType<typeof runExeca> {
    return runExeca(
        CONSOLE_LOGGER,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...execaOptions,
            env: {
                ...execaOptions?.env,
                FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
            },
            doNotPipeOutput: execaOptions?.reject === false,
            signal
        }
    );
}
