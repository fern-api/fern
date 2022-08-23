import semverDiff from "semver-diff";

export function isVersionBehind(a: string, b: string): boolean {
    return semverDiff(a, b) != null;
}
