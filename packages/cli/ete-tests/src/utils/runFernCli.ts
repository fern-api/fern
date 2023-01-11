import { loggingExeca } from "@fern-api/logging-execa";
import { ExecaChildProcess, Options } from "execa";
import path from "path";

export async function runFernCli(args: string[], options?: Options): Promise<ExecaChildProcess> {
    return loggingExeca(undefined, "node", [path.join(__dirname, "../../../cli/dist/dev/cli.cjs"), ...args], {
        ...options,
        env: {
            ...options?.env,
            FERN_TOKEN: process.env.FERN_ETE_TESTS_ACCESS_TOKEN,
        },
        doNotPipeOutput: options?.reject === false,
    });
}
