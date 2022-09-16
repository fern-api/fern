import semverDiff from "semver-diff";

/**
 * returns whether version a came after version b
 */
export function isVersionAhead(a: string, b: string): boolean {
    if (a === b) {
        return false;
    }

    const diff = semverDiff(a, b);

    // generally, diff == null implies that a >= b.
    if (diff == null) {
        // however, fern  versions use git describe, which is not exactly
        // semver-compatible.
        // e.g. in git describe, 0.0.191-2-abc is ahead of 0.0.191.
        //      in semver, 0.0.191-2-abc is a prerelease of (i.e. precedes) 0.0.191.
        // so if semverDiff thinks that b is a prerelease of a, then we know that b
        // actually came after a.
        if (semverDiff(b, a) === "prerelease") {
            return false;
        } else {
            return true;
        }
    }

    // same case here. generally, if diff is defined, then a < b.
    // but if semverDiff thinks that a is a prerelease of b, then we know that a
    // actually came after b.
    return diff === "prerelease";
}
