import { ExecaReturnValue } from "execa";

import { Logger } from "@fern-api/logger";

import { loggingExeca } from "./loggingExeca";

export type LoggingExecutable = (args?: string[], options?: loggingExeca.Options) => Promise<ExecaReturnValue>;

export declare namespace createLoggingExecutable {
    export interface Options extends loggingExeca.Options {
        logger?: Logger;
    }
}

export function createLoggingExecutable(
    executable: string,
    { logger, ...loggingExecaOptions }: createLoggingExecutable.Options = {}
): LoggingExecutable {
    return (args, commandOptions) =>
        loggingExeca(logger, executable, args, { ...loggingExecaOptions, ...commandOptions });
}
