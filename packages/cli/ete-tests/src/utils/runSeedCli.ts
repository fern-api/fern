import { ExecaChildProcess, Options } from "execa";
import path from "path";

import { loggingExeca } from "@fern-api/logging-execa";

export async function runSeedCli(args: string[], options?: Options): Promise<ExecaChildProcess> {
    return loggingExeca(undefined, "node", [path.join(__dirname, "../../../../seed/dist/cli.cjs"), ...args], {
        ...options,
        env: {
            ...options?.env
        },
        doNotPipeOutput: options?.reject === false
    });
}
