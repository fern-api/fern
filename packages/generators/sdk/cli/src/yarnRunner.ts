import { Logger } from "@fern-typescript/commons-v2";
import execa from "execa";

export type YarnRunner = (args: readonly string[], opts?: { env?: Record<string, string> }) => void;

export function createYarnRunner(logger: Logger, directoyOnDiskToWriteTo: string): YarnRunner {
    return async (args, { env } = {}) => {
        logger.debug(`+ ${["yarn", ...args].join(" ")}`);
        const command = execa("yarn", args, {
            cwd: directoyOnDiskToWriteTo,
            env,
        });
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    };
}
