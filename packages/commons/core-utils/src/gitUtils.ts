import { execSync } from "child_process";

/**
 * Returns true if the given ref looks like a commit SHA (7-40 hex characters).
 * Commit SHAs are immutable, so callers can safely resolve them from a local
 * checkout without re-fetching.
 */
export function isCommitSha(ref: string): boolean {
    return /^[0-9a-f]{7,40}$/i.test(ref);
}

/**
 * Returns true if a `git` executable is available on the PATH.
 */
export function isGitAvailable(): boolean {
    try {
        execSync("git --version", { encoding: "utf-8", stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}
