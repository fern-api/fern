import { Logger } from "@fern-api/logger";
import { ChangelogEntryType } from "@fern-fern/generators-sdk/api/resources/generators/resources/commons/types";
import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators/resources/versions/types";

export interface SemVer {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
}

export function parseSemVer(version: string): SemVer {
    const [main, prerelease] = version.split("-", 2);
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
        prerelease
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
    if (
        currentVersion.patch === 0 &&
        (currentVersion.major === previousVersion.major + 1 || currentVersion.minor === previousVersion.minor + 1)
    ) {
        return;
    }
    throw new InvalidSemVerError(
        `Invalid semver change for feature change type: ${previousVersion} -> ${currentVersion}`
    );
}
