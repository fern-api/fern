import execa, { ExecaReturnValue } from "execa";

import { Logger } from "@fern-api/logger";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
    }

    export type Return = Omit<ExecaReturnValue, "stdout" | "stderr"> &
        // the execa types are incorrect and sometimes stdout and stderr and not defined
        Partial<Pick<ExecaReturnValue, "stdout" | "stderr">>;
}

export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {}
): Promise<loggingExeca.Return> {
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
    const command = execa(executable, args, execaOptions);
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    return command;
}
