import { Octokit } from "octokit";

import { parseRepository } from "./parseRepository.js";

/**
 * Returns the latest release tag on a github repository.
 *
 * Uses the GitHub "get latest release" endpoint, which returns the most recent
 * non-draft, non-prerelease release. This avoids the tag ordering issue where
 * listTags sorts by commit date rather than semantic version.
 *
 * If the GITHUB_TOKEN environment variable is set, it will be used to authenticate
 * requests to the GitHub API, enabling access to private repositories.
 *
 * @param githubRepository a string with the format `owner/repo`
 * @param options.authToken optional GitHub auth token (defaults to process.env.GITHUB_TOKEN)
 */
export async function getLatestRelease(
    githubRepository: string,
    options?: { authToken?: string }
): Promise<string | undefined> {
    const { owner, repo } = parseRepository(githubRepository);

    const token = options?.authToken ?? process.env.GITHUB_TOKEN;
    const octokit = token != null ? new Octokit({ auth: token }) : new Octokit();

    try {
        const response = await octokit.rest.repos.getLatestRelease({
            owner,
            repo
        });
        return response.data.tag_name;
    } catch {
        // No releases found (404) or other error — return undefined
        return undefined;
    }
}
