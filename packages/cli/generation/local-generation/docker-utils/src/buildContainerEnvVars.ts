import { FERN_JAVA_SKIP_FORMATTING_ENV_VAR } from "@fern-api/core-utils";

/**
 * Host environment variables that are forwarded into generator containers. Only
 * variables on this list cross the boundary; everything else stays on the host.
 */
export const FORWARDED_ENV_VARS = ["FERN_STACK_TRACK", FERN_JAVA_SKIP_FORMATTING_ENV_VAR];

export interface ContainerEnvVars {
    /** The full environment handed to the container. */
    envVars: Record<string, string>;
    /** Names of the variables that were picked up from the host, for logging. */
    forwardedFromHost: string[];
}

/**
 * Returns the environment for a generator container: the explicitly requested
 * variables, plus any forwarded host variables that were not already specified.
 */
export function buildContainerEnvVars({
    envVars,
    processEnv
}: {
    envVars: Record<string, string>;
    processEnv: NodeJS.ProcessEnv;
}): ContainerEnvVars {
    const forwardedEntries = FORWARDED_ENV_VARS.filter((name) => envVars[name] == null)
        .map((name) => [name, processEnv[name]])
        .filter((entry): entry is [string, string] => entry[1] != null && entry[1] !== "");
    return {
        envVars: { ...Object.fromEntries(forwardedEntries), ...envVars },
        forwardedFromHost: forwardedEntries.map(([name]) => name)
    };
}
