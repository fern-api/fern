import {
    ChangelogEntryType,
    ReleaseRequest
} from "@fern-fern/generators-sdk/api/resources/generators/resources/commons/types";

export function assertValidSemVerOrThrow(version: string): void {
    SemVer.fromString(version);
}

export function assertValidSemVerChangeOrThrow(currentRelease: ReleaseRequest, previousRelease: ReleaseRequest): void {
    const currentVersion = SemVer.fromString(currentRelease.version);
    const previousVersion = SemVer.fromString(previousRelease.version);
    if (currentRelease.changelogEntry?.some((entry) => entry.type === ChangelogEntryType.Feat)) {
        assertValidSemVerChangeForFeatureOrThrow(currentVersion, previousVersion);
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
        const [main, prerelease] = version.split(SemVer.rcSeparator, 2);
        if (main === undefined) {
            throw new InvalidSemVerError(`Invalid semver: ${version}`);
        }
        const [major, minor, patch] = main.split(".");
        if (major === undefined || minor === undefined || patch === undefined) {
            throw new InvalidSemVerError(`Invalid semver: ${version}`);
        }
        return new SemVer(
            parseInt(major),
            parseInt(minor),
            parseInt(patch),
            prerelease ? parseInt(prerelease) : undefined
        );
    }
}

export function assertValidSemVerChangeForFeatureOrThrow(currentVersion: SemVer, previousVersion: SemVer): void {
    if (!isValidSemVerChangeForFeature(currentVersion, previousVersion)) {
        throw new InvalidSemVerError(
            `Invalid semver change for feature change type: ${previousVersion} -> ${currentVersion}`
        );
    }
}

export function isValidSemVerChangeForFeature(currentVersion: SemVer, previousVersion: SemVer): boolean {
    if (currentVersion.major !== previousVersion.major) {
        return (
            currentVersion.major === previousVersion.major + 1 &&
            currentVersion.minor === 0 &&
            currentVersion.patch === 0
        );
    }
    if (currentVersion.minor !== previousVersion.minor) {
        return currentVersion.minor === previousVersion.minor + 1 && currentVersion.patch === 0;
    }
    if (currentVersion.patch !== previousVersion.patch) {
        return false;
    }
    if (currentVersion.prerelease === undefined) {
        return false;
    }
    if (previousVersion.prerelease === undefined) {
        return true;
    }
    return currentVersion.prerelease === previousVersion.prerelease + 1;
}

export class InvalidSemVerError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidSemVerError.prototype);
    }
}
