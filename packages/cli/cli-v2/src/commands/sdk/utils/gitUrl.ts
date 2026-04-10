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
