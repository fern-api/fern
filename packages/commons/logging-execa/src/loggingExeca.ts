import { Logger } from "@fern-api/logger";
import execa, { ExecaReturnValue } from "execa";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
    }
}

export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, ...execaOptions }: loggingExeca.Options = {}
): Promise<ExecaReturnValue> {
    logger?.debug(`+ ${[executable, ...args].join(" ")}`);
    const command = execa(executable, args, execaOptions);
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    return command;
}
