import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

export type YarnRunner = (args: string[], opts?: { env?: Record<string, string> }) => Promise<void>;

export function createYarnRunner(logger: Logger, cwd: string): YarnRunner {
    return async (args, { env } = {}) => {
        await loggingExeca(logger, "yarn", args, { cwd, env });
    };
}
