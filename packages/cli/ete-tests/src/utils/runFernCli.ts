import { ExecaChildProcess, Options } from "execa";
import path from "path";

import { loggingExeca } from "@fern-api/logging-execa";

export async function runFernCli(args: string[], options?: Options): Promise<ExecaChildProcess> {
    return loggingExeca(undefined, "node", [path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args], {
        ...options,
        env: {
            ...options?.env,
            FERN_TOKEN: process.env.FERN_ORG_TOKEN_DEV
        },
        doNotPipeOutput: options?.reject === false
    });
}
