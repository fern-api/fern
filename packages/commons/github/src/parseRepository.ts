import { DEFAULT_REMOTE } from "./constants";
import type { RepositoryReference } from "./RepositoryReference";

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
        throw new Error(`Failed to parse GitHub repostiory ${githubRepository}`);
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
            return cloneUrl.replace("https://", `https://x-access-token:${installationToken}@`);
        }
    };
}

function getRepoUrl({ remote, owner, repo }: { remote: string; owner: string; repo: string }): string {
    return `https://${remote}/${owner}/${repo}`;
}

function getCloneUrl({ remote, owner, repo }: { remote: string; owner: string; repo: string }): string {
    return `https://${remote}/${owner}/${repo}.git`;
}
