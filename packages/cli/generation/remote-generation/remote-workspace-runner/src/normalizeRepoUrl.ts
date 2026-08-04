import { assertNever } from "@fern-api/core-utils";

/**
 * Converts a CI-source repo slug (e.g. "owner/repo") into an HTTPS URL
 * suitable for the docs-ledger `git.repoUrl` field.
 *
 * If the value is already a full URL it is returned as-is.
 */
export function normalizeRepoUrlToHttps(repo: string, provider: "github" | "gitlab" | "bitbucket"): string {
    if (repo.startsWith("https://") || repo.startsWith("http://")) {
        return repo;
    }

    switch (provider) {
        case "github":
            return `https://github.com/${repo}`;
        case "gitlab":
            return `https://gitlab.com/${repo}`;
        case "bitbucket":
            return `https://bitbucket.org/${repo}`;
        default:
            assertNever(provider);
    }
}
