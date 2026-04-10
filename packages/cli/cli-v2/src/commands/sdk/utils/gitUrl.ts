/**
 * Returns true if the given value looks like a GitHub pull request URL.
 *
 * Matches URLs like `https://github.com/owner/repo/pull/123`.
 */
export function isGithubPrUrl(value: string): boolean {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(value);
}

export interface GithubPrUrlInfo {
    owner: string;
    repo: string;
    prNumber: number;
}

/**
 * Parses a GitHub pull request URL into its components.
 *
 * @param url A URL like `https://github.com/owner/repo/pull/123`
 */
export function parseGithubPrUrl(url: string): GithubPrUrlInfo {
    const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (match == null || match[1] == null || match[2] == null || match[3] == null) {
        throw new Error(`Invalid GitHub PR URL: ${url}`);
    }
    return {
        owner: match[1],
        repo: match[2],
        prNumber: parseInt(match[3], 10)
    };
}

/**
 * Returns true if the given value looks like a git URL.
 *
 * Matches URLs ending in `.git`, or starting with `https://github.com/`,
 * `https://gitlab.com/`, or `git@`.
 *
 * Note: GitHub PR URLs (e.g. `https://github.com/owner/repo/pull/123`)
 * are excluded — use `isGithubPrUrl` for those.
 */
export function isGitUrl(value: string): boolean {
    if (isGithubPrUrl(value)) {
        return false;
    }
    return (
        value.endsWith(".git") ||
        value.startsWith("https://github.com/") ||
        value.startsWith("https://gitlab.com/") ||
        value.startsWith("git@")
    );
}
