import type { GithubConfigurationSchema } from "./schemas/index.js";

/**
 * True when a generators.yml `github` block opts into GitHub auto-merge (`auto-merge: true`).
 * Only pull-request mode can carry the flag; push and commit-and-release modes never open a PR.
 */
export function isGithubAutoMergeEnabled(github: GithubConfigurationSchema | undefined): boolean {
    if (github == null || !("auto-merge" in github) || github["auto-merge"] !== true) {
        return false;
    }
    return github.mode === "pull-request";
}
