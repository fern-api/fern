import semver from "semver";

export function parseSemverOrThrow(version: string): semver.SemVer {
    const parsed = semver.parse(version);
    if (parsed === null) {
        throw new Error(`Invalid semver: ${version}`);
    }
    return parsed;
}

export function diffSemverOrThrow(from: string | semver.SemVer, to: string | semver.SemVer): semver.ReleaseType | null {
    const fromSemver = typeof from === "string" ? parseSemverOrThrow(from) : from;
    const toSemver = typeof to === "string" ? parseSemverOrThrow(to) : to;
    if (fromSemver > toSemver) {
        throw new Error("From semver must be less than or equal to to semver");
    }
    return semver.diff(fromSemver, toSemver);
}
