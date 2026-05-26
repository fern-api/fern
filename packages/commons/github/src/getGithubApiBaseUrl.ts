import { DEFAULT_REMOTE } from "./constants.js";
import { parseRepository } from "./parseRepository.js";

/**
 * Derives the GitHub REST API base URL for Octokit from a repository URI.
 * Returns `undefined` for github.com (Octokit's default), or the GHE API
 * endpoint (e.g. `https://github.intuit.com/api/v3`) for Enterprise hosts.
 */
export function getGithubApiBaseUrl(repositoryUri: string): string | undefined {
    const { remote } = parseRepository(repositoryUri);
    if (remote === DEFAULT_REMOTE) {
        return undefined;
    }
    return `https://${remote}/api/v3`;
}
