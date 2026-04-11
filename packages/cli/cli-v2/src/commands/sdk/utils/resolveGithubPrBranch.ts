import { Octokit } from "@octokit/rest";

import type { GithubPrUrlInfo } from "./gitUrl.js";

interface GithubPrBranchInfo {
    /** The head branch of the PR (e.g. "my-feature-branch") */
    branch: string;
    /** The repository URI as "owner/repo" */
    uri: string;
}

/**
 * Fetches the head branch name and repository of a GitHub pull request.
 *
 * Uses the Octokit REST client. Requires a token with read access to the repository.
 */
export async function resolveGithubPrBranch(pr: GithubPrUrlInfo, token: string): Promise<GithubPrBranchInfo> {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.pulls.get({
        owner: pr.owner,
        repo: pr.repo,
        pull_number: pr.prNumber
    });

    const branch = data.head.ref;
    const headRepoFullName = data.head.repo?.full_name;
    if (headRepoFullName == null) {
        throw new Error(`Could not determine head repository for PR #${pr.prNumber}`);
    }

    return {
        branch,
        uri: headRepoFullName
    };
}
