/**
 * Returns true if the given value looks like a git URL.
 *
 * Matches URLs ending in `.git`, or starting with `https://github.com/`,
 * `https://gitlab.com/`, or `git@`.
 */
export function isGitUrl(value: string): boolean {
    return (
        value.endsWith(".git") ||
        value.startsWith("https://github.com/") ||
        value.startsWith("https://gitlab.com/") ||
        value.startsWith("git@")
    );
}

/**
 * Returns true if the value looks like a remote reference but is not a
 * recognized git URL (e.g. plain http/https/ssh URLs, or user@host patterns).
 */
export function looksLikeRemoteReference(value: string): boolean {
    return (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("ssh://") ||
        (value.includes("@") && value.includes(":"))
    );
}
