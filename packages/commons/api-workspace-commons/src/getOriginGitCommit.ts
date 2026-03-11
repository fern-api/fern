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
