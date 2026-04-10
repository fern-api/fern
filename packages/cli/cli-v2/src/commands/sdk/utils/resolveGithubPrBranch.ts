import type { GithubPrUrlInfo } from "./gitUrl.js";

interface GithubPrBranchInfo {
    /** The head branch of the PR (e.g. "my-feature-branch") */
    branch: string;
    /** The repository URI as "owner/repo" */
    uri: string;
}

/**
 * Fetches the head branch name of a GitHub pull request.
 *
 * Uses the GitHub REST API. Requires a token with read access to the repository.
 */
export async function resolveGithubPrBranch(pr: GithubPrUrlInfo, token: string): Promise<GithubPrBranchInfo> {
    const url = `https://api.github.com/repos/${pr.owner}/${pr.repo}/pulls/${pr.prNumber}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "fern-cli"
        }
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
            `Failed to fetch PR #${pr.prNumber} from ${pr.owner}/${pr.repo}: ${response.status} ${response.statusText}${body ? `\n${body}` : ""}`
        );
    }

    const data = (await response.json()) as { head?: { ref?: string } };
    const branch = data.head?.ref;
    if (branch == null) {
        throw new Error(`Could not determine head branch for PR #${pr.prNumber}`);
    }

    return {
        branch,
        uri: `${pr.owner}/${pr.repo}`
    };
}
