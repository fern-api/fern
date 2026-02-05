import {
    ChangelogEntryType,
    ReleaseRequest
} from "@fern-fern/generators-sdk/api/resources/generators/resources/commons/types";

export function assertValidSemVerOrThrow(version: string): void {
    SemVer.fromString(version);
}

// TODO: Current version comparison logic for prerelease/RC versions:
//
// We currently allow feature-level changes (major/minor/patch) when comparing RC versions,
// which means going from 1.0.0-rc17 -> 1.0.0-rc18 is considered valid for feature changes.
//
// This is a simplified approach that works for most cases but has an edge case:
// - Going from 0.x.y -> 1.0.0-rc<> is valid (major version bump with RC)
// - Going from 1.0.0 -> 1.0.1-rc18 would NOT be valid (minor bump without proper RC progression)
//
// Future improvement needed: Instead of just comparing the two most recent versions,
// we should implement logic that:
// 1. If the latest version is non-RC, compare it to the last non-RC version
// 2. If the latest version is RC, compare it to the previous RC version
// 3. This would prevent bundling features in patch releases that go directly to RC
//
// For now, we're keeping the current logic to avoid complexity, but this edge case exists.

export function assertValidSemVerChangeOrThrow(currentRelease: ReleaseRequest, previousRelease: ReleaseRequest): void {
    const currentVersion = SemVer.fromString(currentRelease.version);
    const previousVersion = SemVer.fromString(previousRelease.version);
    if (!isValidSemVerChange(currentVersion, previousVersion)) {
        throw new InvalidSemVerError(`Invalid semver change: ${previousRelease.version} -> ${currentRelease.version}`);
    }
    if (currentRelease.changelogEntry?.some((entry) => entry.type === ChangelogEntryType.Feat)) {
        if (!hasFeatureLevelSemVerChange(currentVersion, previousVersion)) {
            throw new InvalidSemVerError(
                `Invalid semver change for feature change type: ${previousRelease.version} -> ${currentRelease.version}`
            );
        }
    }
}

export class SemVer {
    private static readonly rcSeparator = "-rc";

    constructor(
        public readonly major: number,
        public readonly minor: number,
        public readonly patch: number,
        public readonly prerelease?: number
    ) {}

    toString(): string {
        let version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease !== undefined) {
            version += `${SemVer.rcSeparator}${this.prerelease}`;
        }
        return version;
    }

    static fromString(version: string): SemVer {
        const throwInvalid = () => {
            throw new InvalidSemVerError(`Invalid semver: ${version}`);
        };

        const parts = version.split(".");
        if (parts.length !== 3) throwInvalid();

        const [major, minor, patchRaw] = parts as [string, string, string];

        const patchParts = patchRaw.split(SemVer.rcSeparator);
        if (patchParts.length > 2) throwInvalid();

        const [patch, prerelease] = patchParts as [string, string | undefined];

        // Validate all parts are numeric (and non-empty)
        const isInteger = (str: string) => /^\d+$/.test(str);

        if (!isInteger(major) || !isInteger(minor) || !isInteger(patch)) {
            throwInvalid();
        }

        if (prerelease !== undefined && !isInteger(prerelease)) {
            throwInvalid();
        }

        return new SemVer(
            parseInt(major),
            parseInt(minor),
            parseInt(patch),
            prerelease ? parseInt(prerelease) : undefined
        );
    }
}

export function hasFeatureLevelSemVerChange(currentVersion: SemVer, previousVersion: SemVer): boolean {
    return (
        currentVersion.major !== previousVersion.major ||
        currentVersion.minor !== previousVersion.minor ||
        currentVersion.prerelease !== previousVersion.prerelease
    );
}

export function isValidSemVerChange(currentVersion: SemVer, previousVersion: SemVer): boolean {
    // If major version has changed, it should only be incremented by 1, and other version numbers should be reset
    if (currentVersion.major !== previousVersion.major) {
        return (
            currentVersion.major === previousVersion.major + 1 &&
            currentVersion.minor === 0 &&
            currentVersion.patch === 0 &&
            (currentVersion.prerelease === undefined || currentVersion.prerelease === 0)
        );
    }
    // If minor version has changed, it should only be incremented by 1, and prerelease should be reset
    if (currentVersion.minor !== previousVersion.minor) {
        return (
            currentVersion.minor === previousVersion.minor + 1 &&
            (currentVersion.prerelease === undefined || currentVersion.prerelease === 0)
        );
    }
    // If patch version has changed, it should only be incremented by 1, and prerelease should be reset
    if (currentVersion.patch !== previousVersion.patch) {
        return (
            currentVersion.patch === previousVersion.patch + 1 &&
            (currentVersion.prerelease === undefined || currentVersion.prerelease === 0)
        );
    }
    // If current version has no prerelease but previous version does (ex: 4.29.2-rc0), it's a valid RC-to-final transition (4.29.2-rc0 -> 4.29.2)
    if (currentVersion.prerelease === undefined && previousVersion.prerelease !== undefined) {
        return true;
    }
    // If prerelease is undefined, and no other versions are different, it's invalid
    if (currentVersion.prerelease === undefined) {
        return false;
    }
    // If previous version is not a prerelease, and current version is a prerelease, it's valid
    if (previousVersion.prerelease === undefined) {
        return true;
    }
    // If current and prev both have prerelease versions, the prerelease number should be incremented by 1
    return currentVersion.prerelease === previousVersion.prerelease + 1;
}

export class InvalidSemVerError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidSemVerError.prototype);
    }
}
