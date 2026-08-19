import { execSync } from "child_process";

/**
 * Resolves the current git commit hash of the working directory.
 * Returns "DUMMY" if IGNORE_GIT_IN_METADATA environment variable is set.
 * Returns undefined if not in a git repo or if git is not available.
 */
export function getOriginGitCommit(): string | undefined {
    if (process.env.IGNORE_GIT_IN_METADATA === "true") {
        return "DUMMY";
    }

    try {
        const commit = execSync("git rev-parse HEAD", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        }).trim();

        // Validate it looks like a git commit hash (40 hex chars)
        if (/^[0-9a-f]{40}$/.test(commit)) {
            return commit;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

/**
 * Returns whether the working directory has uncommitted changes.
 * Returns undefined if not in a git repo, if git is not available, or if the
 * `IGNORE_GIT_IN_METADATA` environment variable is set.
 */
export function getOriginGitCommitIsDirty(): boolean | undefined {
    if (process.env.IGNORE_GIT_IN_METADATA === "true") {
        return undefined;
    }

    try {
        const status = execSync("git status --porcelain", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        });
        return status.trim().length > 0;
    } catch {
        // Expected when git is not installed or the working directory is not a git repository.
        return undefined;
    }
}
