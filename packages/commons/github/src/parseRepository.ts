import { DEFAULT_REMOTE } from "./constants.js";
import type { RepositoryReference } from "./RepositoryReference.js";

/**
 * Parses the repository into a RepositoryReference.
 * @param githubRepository a string in a variety of formats (e.g. `owner/repo`, `github.com/owner/repo`)
 */
export function parseRepository(githubRepository: string): RepositoryReference {
    let remote = DEFAULT_REMOTE;
    let owner: string;
    let repo: string;

    // Remove the prefix and suffix (if any).
    if (githubRepository.startsWith("https://")) {
        githubRepository = githubRepository.replace("https://", "");
    }
    if (githubRepository.endsWith(".git")) {
        githubRepository = githubRepository.slice(0, -4);
    }

    const parts = githubRepository.split("/");

    if (parts.length === 2 && parts[0] != null && parts[1] != null) {
        // Format: owner/repo
        [owner, repo] = parts;
    } else if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
        // Format: github.com/owner/repo
        [remote, owner, repo] = parts;
    } else {
        throw new Error(`Failed to parse GitHub repository ${githubRepository}`);
    }

    return newRepositoryReference({ remote, owner, repo });
}

function newRepositoryReference({
    remote,
    owner,
    repo
}: {
    remote: string;
    owner: string;
    repo: string;
}): RepositoryReference {
    const repoUrl = getRepoUrl({ remote, owner, repo });
    const cloneUrl = getCloneUrl({ remote, owner, repo });
    return {
        remote,
        owner,
        repo,
        repoUrl,
        cloneUrl,
        getAuthedCloneUrl: (installationToken: string) => {
            // GitHub App installation tokens (`ghs_*`) and user-to-server tokens
            // issued by GitHub Apps (`ghu_*`) authenticate as the special
            // `x-access-token` user. OAuth user tokens (`gho_*`), classic PATs
            // (`ghp_*`), fine-grained PATs (`github_pat_*`), and legacy 40-char
            // hex PATs (pre-2021, no prefix) authenticate as the token itself —
            // using `x-access-token` for those returns "Invalid username or token".
            const isInstallationToken = installationToken.startsWith("ghs_") || installationToken.startsWith("ghu_");
            const userPrefix = isInstallationToken ? "x-access-token:" : "";
            return cloneUrl.replace("https://", `https://${userPrefix}${installationToken}@`);
        }
    };
}

function getRepoUrl({ remote, owner, repo }: { remote: string; owner: string; repo: string }): string {
    return `https://${remote}/${owner}/${repo}`;
}

function getCloneUrl({ remote, owner, repo }: { remote: string; owner: string; repo: string }): string {
    return `https://${remote}/${owner}/${repo}.git`;
}
