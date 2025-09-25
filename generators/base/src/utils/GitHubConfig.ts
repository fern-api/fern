import { isNonNullish } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";

/**
 * The configuration used to interact with a GitHub repository.
 */
export interface RawGithubConfig {
    sourceDirectory: string;
    type?: string;
    uri?: string;
    token?: string;
    branch?: string;
    mode?: "pull-request";
}

export interface ResolvedGithubConfig {
    sourceDirectory: string;
    uri: string;
    token: string;
    branch?: string;
    mode?: "pull-request";
}

export function resolveGitHubConfig({
    rawGithubConfig,
    logger
}: {
    rawGithubConfig: RawGithubConfig;
    logger: Logger;
}): ResolvedGithubConfig {
    if (rawGithubConfig.type == null) {
        logger.error("Publishing config is missing");
        throw new Error("Publishing config is required for GitHub actions");
    }

    if (rawGithubConfig.type !== "github") {
        logger.error(`Publishing type ${rawGithubConfig.type} is not supported`);
        throw new Error("Only GitHub publishing is supported");
    }

    if (!(isNonNullish(rawGithubConfig.uri) && isNonNullish(rawGithubConfig.token))) {
        logger.error("GitHub URI or token is missing in publishing config");
        throw new Error("GitHub URI and token are required in publishing config");
    }

    return {
        sourceDirectory: rawGithubConfig.sourceDirectory,
        uri: rawGithubConfig.uri,
        token: rawGithubConfig.token,
        branch: rawGithubConfig.branch,
        mode: rawGithubConfig.mode
    };
}
