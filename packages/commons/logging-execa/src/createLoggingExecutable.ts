import { Logger } from "@fern-api/logger";
import execa, { ExecaReturnValue } from "execa";
import { loggingExeca } from "./loggingExeca";

export type LoggingExecutable = (args?: string[], options?: loggingExeca.Options) => Promise<ExecaReturnValue>;

export declare namespace createLoggingExecutable {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        logger?: Logger;
    }
}

export function createLoggingExecutable(
    executable: string,
    options: createLoggingExecutable.Options = {}
): LoggingExecutable {
    return (args, commandOptions) => loggingExeca(executable, args, { ...options, ...commandOptions });
}
