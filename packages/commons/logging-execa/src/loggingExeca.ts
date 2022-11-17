import { Logger } from "@fern-api/logger";
import execa, { ExecaReturnValue } from "execa";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
    }
}

export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], ...execaOptions }: loggingExeca.Options = {}
): Promise<ExecaReturnValue> {
    let logLine = [executable, ...args].join(" ");
    for (const secret of secrets) {
        logLine = logLine.replaceAll(secret, "<redacted>");
    }
    logger?.debug(`+ ${logLine}`);
    const command = execa(executable, args, execaOptions);
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    return command;
}
