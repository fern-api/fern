const POST_RELEASE_COMMIT_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-([0-9]+)-([a-z0-9])+$/;
const POST_RC_COMMIT_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-rc[.-]?([0-9]+)-([0-9]+)-([a-z0-9])+$/;
const RC_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-rc[.-]?([0-9]+)$/;
const RELEASE_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/;
const ALPHA_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-alpha[.-]?([0-9]+)$/;
const BETA_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-beta[.-]?([0-9]+)$/;

export interface BaseVersion {
    major: number;
    minor: number;
    patch: number;
}

export type ParsedVersion =
    | Release
    | PostReleaseCommit
    | ReleaseCandidate
    | PostReleaseCandidateCommit
    | AlphaRelease
    | BetaRelease;

export interface ReleaseCandidate extends BaseVersion {
    type: "rc";
    releaseCandidateIndex: number;
}

export interface PostReleaseCandidateCommit extends BaseVersion {
    type: "post-rc-commit";
    releaseCandidateIndex: number;
    commitIndex: number;
}

export interface Release extends BaseVersion {
    type: "release";
}

export interface PostReleaseCommit extends BaseVersion {
    type: "post-release-commit";
    commitIndex: number;
}

export interface AlphaRelease extends BaseVersion {
    type: "alpha";
    index: number;
}
export interface BetaRelease extends BaseVersion {
    type: "beta";
    index: number;
}

export function parseVersion(versionString: string): ParsedVersion {
    const alphaMatch = versionString.match(ALPHA_VERSION_REGEX);
    if (alphaMatch != null) {
        const [_, major, minor, patch, index] = alphaMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        const parsedIndex = parseNumber(index);
        if (parsedMajor == null || parsedMinor == null || parsedPatch == null || parsedIndex == null) {
            throw new Error("Cannot parse alpha version: " + versionString);
        }
        return {
            type: "alpha",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch,
            index: parsedIndex
        };
    }

    const betaMatch = versionString.match(BETA_VERSION_REGEX);
    if (betaMatch != null) {
        const [_, major, minor, patch, index] = betaMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        const parsedIndex = parseNumber(index);
        if (parsedMajor == null || parsedMinor == null || parsedPatch == null || parsedIndex == null) {
            throw new Error("Cannot parse beta version: " + versionString);
        }
        return {
            type: "beta",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch,
            index: parsedIndex
        };
    }

    const postReleaseCommitMatch = versionString.match(POST_RELEASE_COMMIT_VERSION_REGEX);
    if (postReleaseCommitMatch != null) {
        const [_, major, minor, patch, commitIndex] = postReleaseCommitMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        const parsedCommitIndex = parseNumber(commitIndex);
        if (parsedMajor == null || parsedMinor == null || parsedPatch == null || parsedCommitIndex == null) {
            throw new Error("Cannot parse post-release commit version: " + versionString);
        }
        return {
            type: "post-release-commit",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch,
            commitIndex: parsedCommitIndex
        };
    }

    const rcMatch = versionString.match(RC_VERSION_REGEX);
    if (rcMatch != null) {
        const [_, major, minor, patch, rcIndex] = rcMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        const parsedRcIndex = parseNumber(rcIndex);
        if (parsedMajor == null || parsedMinor == null || parsedPatch == null || parsedRcIndex == null) {
            throw new Error("Cannot parse RC version: " + versionString);
        }
        return {
            type: "rc",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch,
            releaseCandidateIndex: parsedRcIndex
        };
    }

    const postRcCommitMatch = versionString.match(POST_RC_COMMIT_VERSION_REGEX);
    if (postRcCommitMatch != null) {
        const [_, major, minor, patch, rcIndex, commitIndex] = postRcCommitMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        const parsedRcIndex = parseNumber(rcIndex);
        const parsedCommitIndex = parseNumber(commitIndex);
        if (
            parsedMajor == null ||
            parsedMinor == null ||
            parsedPatch == null ||
            parsedRcIndex == null ||
            parsedCommitIndex == null
        ) {
            throw new Error("Cannot parse post-RC version: " + versionString);
        }
        return {
            type: "post-rc-commit",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch,
            releaseCandidateIndex: parsedRcIndex,
            commitIndex: parsedCommitIndex
        };
    }

    const releaseMatch = versionString.match(RELEASE_REGEX);
    if (releaseMatch != null) {
        const [_, major, minor, patch] = releaseMatch;
        const parsedMajor = parseNumber(major);
        const parsedMinor = parseNumber(minor);
        const parsedPatch = parseNumber(patch);
        if (parsedMajor == null || parsedMinor == null || parsedPatch == null) {
            throw new Error("Cannot parse release version: " + versionString);
        }
        return {
            type: "release",
            major: parsedMajor,
            minor: parsedMinor,
            patch: parsedPatch
        };
    }

    throw new Error("Failed to parse version: " + versionString);
}

function parseNumber(maybeNumber: string | undefined): number | undefined {
    if (maybeNumber == null || maybeNumber.length === 0) {
        return undefined;
    }
    const parsed = Number(maybeNumber);
    if (isNaN(parsed)) {
        return undefined;
    }
    return parsed;
}
