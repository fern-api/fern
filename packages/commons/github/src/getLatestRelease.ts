import { Octokit } from "octokit";
import semver from "semver";

import { parseRepository } from "./parseRepository.js";

/**
 * Returns true if the tag is a semver prerelease version.
 * e.g. "1.0.0-beta", "v0.0.0-dev-abc123" → true; "1.0.0", "v2.3.4" → false.
 */
function isSemverPrerelease(tag: string): boolean {
    return semver.prerelease(tag) != null;
}

/**
 * Returns the latest release tag on a github repository.
 *
 * Uses the GitHub "get latest release" endpoint, which returns the most recent
 * non-draft, non-prerelease release. Note that "prerelease" here refers to
 * GitHub's prerelease flag, not the semver concept. A release tagged
 * "0.0.0-dev-abc123" may not be flagged as a GitHub prerelease but IS a semver
 * prerelease.
 *
 * If the latest release has a semver prerelease tag, this function falls back to
 * paginating through recent releases to find the first non-prerelease one.
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
        const tag = response.data.tag_name;

        if (!isSemverPrerelease(tag)) {
            return tag;
        }

        // The "latest" release is a semver prerelease — scan recent releases
        // for the first stable (non-semver-prerelease, non-draft, non-GitHub-prerelease) tag.
        const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
            owner,
            repo,
            per_page: 100
        });

        for (const release of releases) {
            if (release.draft || release.prerelease) {
                continue;
            }
            if (!isSemverPrerelease(release.tag_name)) {
                return release.tag_name;
            }
        }

        return undefined;
    } catch {
        // No releases found (404) or other error — return undefined
        return undefined;
    }
}
