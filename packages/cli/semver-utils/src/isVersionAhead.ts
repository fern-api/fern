import semverDiff from "semver-diff";

const POST_RELEASE_COMMIT_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-([0-9]+)-([a-z0-9])+$/;
const POST_RC_COMMIT_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)-([0-9]+)-([a-z0-9])+$/;
const RC_VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)$/;
const VERSION_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/;

type Version = Release | PostReleaseCommit | ReleaseCandidate | PostReleaseCandidateCommit;

interface ReleaseCandidate {
    type: "rc";
    forVersion: string;
    releaseCandidateIndex: number;
}

interface PostReleaseCandidateCommit {
    type: "post-rc-commit";
    forVersion: string;
    releaseCandidateIndex: number;
    commitIndex: number;
}

interface Release {
    type: "release";
    version: string;
}

interface PostReleaseCommit {
    type: "post-release-commit";
    releasedVersion: string;
    commitIndex: number;
}

/**
 * returns whether version a came after version b
 */
export function isVersionAhead(a: string, b: string): boolean {
    if (a === b) {
        return false;
    }

    const aVersion = parseVersion(a);
    const bVersion = parseVersion(b);

    // if versions are different, then default to semverDiff
    const aVersionString = getVersionString(aVersion);
    const bVersionString = getVersionString(bVersion);
    if (aVersionString !== bVersionString) {
        return semverDiff(aVersionString, bVersionString) == null;
    }

    if (aVersion.type === "post-release-commit") {
        return bVersion.type !== "post-release-commit" || aVersion.commitIndex > bVersion.commitIndex;
    }

    if (aVersion.type === "release") {
        return bVersion.type !== "post-release-commit";
    }

    if (aVersion.type === "rc") {
        switch (bVersion.type) {
            case "release":
            case "post-release-commit":
                return false;
        }

        return (
            aVersion.releaseCandidateIndex !== bVersion.releaseCandidateIndex &&
            aVersion.releaseCandidateIndex > bVersion.releaseCandidateIndex
        );
    }

    if (bVersion.type === "post-rc-commit") {
        if (aVersion.releaseCandidateIndex !== bVersion.releaseCandidateIndex) {
            return aVersion.releaseCandidateIndex > bVersion.releaseCandidateIndex;
        }
        return aVersion.commitIndex > bVersion.commitIndex;
    }

    // if here, 'a' is a post-rc-commit and 'b' is not, so just recursively run
    // to avoid duplicate logic
    return !isVersionAhead(b, a);
}

function parseVersion(versionString: string): Version {
    const postReleaseCommitMatch = versionString.match(POST_RELEASE_COMMIT_VERSION_REGEX);
    if (postReleaseCommitMatch != null) {
        const [_, major, minor, patch, commitIndex] = postReleaseCommitMatch;
        const parsedCommitIndex = Number(commitIndex);
        if (
            major == null ||
            minor == null ||
            patch == null ||
            commitIndex == null ||
            commitIndex.length === 0 ||
            isNaN(parsedCommitIndex)
        ) {
            throw new Error("Cannot parse post-release commit version: " + versionString);
        }
        return {
            type: "post-release-commit",
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

    const postRcCommitMatch = versionString.match(POST_RC_COMMIT_VERSION_REGEX);
    if (postRcCommitMatch != null) {
        const [_, major, minor, patch, rcIndex, commitIndex] = postRcCommitMatch;
        const parsedRcIndex = Number(rcIndex);
        const parsedCommitIndex = Number(commitIndex);
        if (
            major == null ||
            minor == null ||
            patch == null ||
            rcIndex == null ||
            rcIndex.length === 0 ||
            isNaN(parsedRcIndex) ||
            commitIndex == null ||
            commitIndex.length === 0 ||
            isNaN(parsedCommitIndex)
        ) {
            throw new Error("Cannot parse post-RC version: " + versionString);
        }
        return {
            type: "post-rc-commit",
            forVersion: `${major}.${minor}.${patch}`,
            releaseCandidateIndex: parsedRcIndex,
            commitIndex: parsedCommitIndex,
        };
    }

    if (!VERSION_REGEX.test(versionString)) {
        throw new Error("Failed to parse version: " + versionString);
    }

    return {
        type: "release",
        version: versionString,
    };
}

function getVersionString(version: Version): string {
    switch (version.type) {
        case "post-release-commit":
            return version.releasedVersion;
        case "rc":
        case "post-rc-commit":
            return version.forVersion;
        case "release":
            return version.version;
    }
}
