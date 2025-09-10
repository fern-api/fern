import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import { Options } from "execa";
import path from "path";

export async function runFernCli(
    args: string[],
    options?: Options,
    includeAuthToken: boolean = true
): Promise<loggingExeca.ReturnValue> {
    const env = {
        ...options?.env,
        ...(includeAuthToken ? { FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV } : {})
    };

    return loggingExeca(
        undefined,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args],
        {
            ...options,
            env,
            doNotPipeOutput: options?.reject === false
        }
    );
}

export async function runFernCliWithoutAuthToken(args: string[], options?: Options): Promise<loggingExeca.ReturnValue> {
    return runFernCli(args, options, false);
}

export function captureFernCli(args: string[], options?: Options): import("execa").ExecaChildProcess {
    return runExeca(
        undefined,
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
}
