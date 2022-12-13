import semverDiff from "semver-diff";

const COMMIT_VERSION_REGEX = /([0-9]+)\.([0-9]+)\.([0-9]+)-([0-9]+)-.+/;
const RC_VERSION_REGEX = /([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)/;

type Version = ReleaseCandidate | Release | PostReleaseCommit;

interface ReleaseCandidate {
    type: "rc";
    forVersion: string;
    releaseCandidateIndex: number;
}

interface Release {
    type: "release";
    version: string;
}

interface PostReleaseCommit {
    type: "commit";
    releasedVersion: string;
    commitIndex: number;
}

/**
 * returns whether version a came after version b
 */
export function isVersionAhead(a: string, b: string): boolean {
    const aVersion = parseVersion(a);
    const bVersion = parseVersion(b);

    // if versions are different, then default to semverDiff
    const aVersionString = getVersionString(aVersion);
    const bVersionString = getVersionString(bVersion);
    if (aVersionString !== bVersionString) {
        return semverDiff(aVersionString, bVersionString) == null;
    }

    if (aVersion.type === "commit") {
        return bVersion.type !== "commit" || aVersion.commitIndex > bVersion.commitIndex;
    }

    if (aVersion.type === "release") {
        switch (bVersion.type) {
            case "commit":
            case "release":
                return false;
            case "rc":
                return true;
        }
    }

    return bVersion.type === "rc" && aVersion.releaseCandidateIndex > bVersion.releaseCandidateIndex;
}

function parseVersion(versionString: string): Version {
    const commitMatch = versionString.match(COMMIT_VERSION_REGEX);
    if (commitMatch != null) {
        const [_, major, minor, patch, commitIndex] = commitMatch;
        const parsedCommitIndex = Number(commitIndex);
        if (
            major == null ||
            minor == null ||
            patch == null ||
            commitIndex == null ||
            commitIndex.length === 0 ||
            isNaN(parsedCommitIndex)
        ) {
            throw new Error("Cannot parse commit version: " + versionString);
        }
        return {
            type: "commit",
            releasedVersion: `${major}.${minor}.${patch}`,
            commitIndex: parsedCommitIndex,
        };
    }

    const rcMatch = versionString.match(RC_VERSION_REGEX);
    if (rcMatch != null) {
        const [_, major, minor, patch, rcIndex] = rcMatch;
        const parsedRcIndex = Number(rcIndex);
        if (
            major == null ||
            minor == null ||
            patch == null ||
            rcIndex == null ||
            rcIndex.length === 0 ||
            isNaN(parsedRcIndex)
        ) {
            throw new Error("Cannot parse RC version: " + versionString);
        }
        return {
            type: "rc",
            forVersion: `${major}.${minor}.${patch}`,
            releaseCandidateIndex: parsedRcIndex,
        };
    }

    return {
        type: "release",
        version: versionString,
    };
}

function getVersionString(version: Version): string {
    switch (version.type) {
        case "commit":
            return version.releasedVersion;
        case "rc":
            return version.forVersion;
        case "release":
            return version.version;
    }
}
