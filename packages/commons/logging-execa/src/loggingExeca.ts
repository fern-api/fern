import execa, { ExecaReturnValue } from "execa";

import { Logger } from "@fern-api/logger";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
    }

    export type ReturnValue = ExecaReturnValue;
}

// returns the current command being run by execa
export function runExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {}
): import("execa").ExecaChildProcess {
    const allSubstitutions = secrets.reduce(
        (acc, secret) => ({
            ...acc,
            [secret]: "<redacted>"
        }),
        substitutions
    );

    let logLine = [executable, ...args].join(" ");
    for (const [substitutionKey, substitutionValue] of Object.entries(allSubstitutions)) {
        logLine = logLine.replaceAll(substitutionKey, substitutionValue);
    }

    logger?.debug(`+ ${logLine}`);
    return execa(executable, args, execaOptions);
}

// finishes executing the command and returns the result
export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {}
): Promise<loggingExeca.ReturnValue> {
    const command = runExeca(logger, executable, args, { doNotPipeOutput, secrets, substitutions, ...execaOptions });
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    const result = await command;
    if (result.stdout == null) {
        result.stdout = "";
    }
    if (result.stderr == null) {
        result.stderr = "";
    }
    return result;
}
