import { loggingExeca } from "@fern-api/logging-execa";
import { ExecaChildProcess, Options } from "execa";
import path from "path";

export async function runSeedCli(args: string[], options?: Options): Promise<ExecaChildProcess> {
    return loggingExeca(
        undefined,
        "node",
        ["--enable-source-maps", path.join(__dirname, "../../../../seed/dist/cli.cjs"), ...args],
        {
            ...options,
            env: {
                ...options?.env
            },
            doNotPipeOutput: options?.reject === false
        }
    );
}
