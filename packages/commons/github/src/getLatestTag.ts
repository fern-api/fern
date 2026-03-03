import { Octokit } from "octokit";

import { parseRepository } from "./parseRepository.js";

/**
 * Returns the latest tag on a github repository.
 *
 * If the GITHUB_TOKEN environment variable is set, it will be used to authenticate
 * requests to the GitHub API, enabling access to private repositories.
 *
 * @param githubRepository a string with the format `owner/repo`
 * @param options.authToken optional GitHub auth token (defaults to process.env.GITHUB_TOKEN)
 */
export async function getLatestTag(
    githubRepository: string,
    options?: { authToken?: string }
): Promise<string | undefined> {
    const { owner, repo } = parseRepository(githubRepository);

    const token = options?.authToken ?? process.env.GITHUB_TOKEN;
    const octokit = token != null ? new Octokit({ auth: token }) : new Octokit();
    const response = await octokit.rest.repos.listTags({
        owner,
        repo,
        per_page: 1 // Fetch only the latest tag
    });

    return response.data?.[0]?.name;
}
