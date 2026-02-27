import { Octokit } from "octokit";
import semver from "semver";

import { parseRepository } from "./parseRepository.js";

/**
 * Returns the tag with the highest semantic version on a github repository.
 * Fetches all tags (paginated) and returns the one with the greatest semver.
 * @param githubRepository a string with the format `owner/repo`
 */
export async function getLatestTag(githubRepository: string): Promise<string | undefined> {
    const { owner, repo } = parseRepository(githubRepository);

    const octokit = new Octokit();

    // Fetch all tags using pagination
    const tags: string[] = [];
    let page = 1;
    while (true) {
        const response = await octokit.rest.repos.listTags({
            owner,
            repo,
            per_page: 100,
            page
        });
        if (response.data.length === 0) {
            break;
        }
        for (const tag of response.data) {
            tags.push(tag.name);
        }
        if (response.data.length < 100) {
            break;
        }
        page++;
    }

    // Parse and find the highest semver tag
    let highestVersion: semver.SemVer | null = null;
    let highestTagName: string | undefined;

    for (const tagName of tags) {
        const parsed = semver.parse(tagName) ?? semver.parse(semver.coerce(tagName));
        if (parsed != null) {
            if (highestVersion == null || semver.gt(parsed, highestVersion)) {
                highestVersion = parsed;
                highestTagName = tagName;
            }
        }
    }

    return highestTagName;
}
