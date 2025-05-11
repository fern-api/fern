import { Options } from "execa";
import path from "path";

import { loggingExeca, runExeca } from "@fern-api/logging-execa";

export async function runFernCli(args: string[], options?: Options): Promise<loggingExeca.ReturnValue> {
    return loggingExeca(undefined, "node", [path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args], {
        ...options,
        env: {
            ...options?.env,
            FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
        },
        doNotPipeOutput: options?.reject === false
    });
}

export function captureFernCli(args: string[], options?: Options): import("execa").ExecaChildProcess {
    return runExeca(undefined, "node", [path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args], {
        ...options,
        env: {
            ...options?.env,
            FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
        },
        doNotPipeOutput: options?.reject === false
    });
}
