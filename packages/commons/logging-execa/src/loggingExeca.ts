import { Logger } from "@fern-api/logger";
import execa, { ExecaReturnValue } from "execa";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
    }
}

export async function loggingExeca(
    logger: Logger | undefined,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {}
): Promise<ExecaReturnValue> {
    logger?.info("1");
    const allSubstitutions = secrets.reduce(
        (acc, secret) => ({
            ...acc,
            [secret]: "<redacted>",
        }),
        substitutions
    );

    logger?.info("2");
    let logLine = [executable, ...args].join(" ");

    logger?.info("3");
    for (const [substitutionKey, substitutionValue] of Object.entries(allSubstitutions)) {
        logLine = logLine.replaceAll(substitutionKey, substitutionValue);
    }

    logger?.debug(`+ ${logLine}`);

    logger?.info("4");
    const command = execa(executable, args, execaOptions);

    logger?.info("5");
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    logger?.info("6");
    return command;
}
