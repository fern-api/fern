import { Logger } from "@fern-api/logger";
import {
    ChangelogEntryType,
    ReleaseRequest
} from "@fern-fern/generators-sdk/api/resources/generators/resources/commons/types";
import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators/resources/versions/types";

export interface SemVer {
    major: number;
    minor: number;
    patch: number;
    prerelease?: number;
}

export function parseSemVer(version: string): SemVer {
    const [main, prerelease] = version.split("-r", 2);
    if (main === undefined) {
        throw new InvalidSemVerError(`Invalid semver: ${version}`);
    }
    const [major, minor, patch] = main.split(".");
    if (major === undefined || minor === undefined || patch === undefined) {
        throw new InvalidSemVerError(`Invalid semver: ${version}`);
    }
    return {
        major: parseInt(major),
        minor: parseInt(minor),
        patch: parseInt(patch),
        prerelease: prerelease ? parseInt(prerelease) : undefined
    };
}

export function assertValidSemVerOrThrow(version: string): void {
    parseSemVer(version);
}

export class InvalidSemVerError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidSemVerError.prototype);
    }
}

export function assertValidSemVerChangeForFeatureOrThrow(currentVersion: SemVer, previousVersion: SemVer): void {
    if (!isValidSemVerChangeForFeature(currentVersion, previousVersion)) {
        throw new InvalidSemVerError(
            `Invalid semver change for feature change type: ${previousVersion} -> ${currentVersion}`
        );
    }
}

export function assertValidSemVerChange(currentRelease: ReleaseRequest, previousRelease: ReleaseRequest): void {
    const currentVersion = parseSemVer(currentRelease.version);
    const previousVersion = parseSemVer(previousRelease.version);
    if (currentRelease.changelogEntry?.some((entry) => entry.type === ChangelogEntryType.Feat)) {
        assertValidSemVerChangeForFeatureOrThrow(currentVersion, previousVersion);
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
