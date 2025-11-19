import { Octokit } from "octokit";

import { parseRepository } from "./parseRepository";

/**
 * Returns the latest tag on a github repository
 * @param githubRepository a string with the format `owner/repo`
 */
export async function getLatestTag(githubRepository: string): Promise<string | undefined> {
    const { owner, repo } = parseRepository(githubRepository);

    const octokit = new Octokit();
    const response = await octokit.rest.repos.listTags({
        owner,
        repo,
        per_page: 1 // Fetch only the latest tag
    });

    return response.data?.[0]?.name;
}
