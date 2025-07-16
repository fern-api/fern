import semverDiff from "semver-diff";

import { ParsedVersion, parseVersion } from "./parseVersion";

/**
 * returns whether version a came after version b
 */
export function isVersionAhead(a: string, b: string): boolean {
    if (a === b) {
        return false;
    }

    const aVersion = parseVersion(a);
    const bVersion = parseVersion(b);

    // if major/minor/patch versions are different, then default to semverDiff
    if (aVersion.major !== bVersion.major || aVersion.minor !== bVersion.minor || aVersion.patch !== bVersion.patch) {
        return semverDiff(getReleaseVersion(aVersion), getReleaseVersion(bVersion)) == null;
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
            case "alpha":
            case "beta":
                return true;
        }

        return (
            aVersion.releaseCandidateIndex !== bVersion.releaseCandidateIndex &&
            aVersion.releaseCandidateIndex > bVersion.releaseCandidateIndex
        );
    }

    if (aVersion.type === "post-rc-commit") {
        switch (bVersion.type) {
            case "release":
            case "post-release-commit":
                return false;
            case "alpha":
            case "beta":
                return true;
        }

        if (bVersion.type === "post-rc-commit") {
            if (aVersion.releaseCandidateIndex !== bVersion.releaseCandidateIndex) {
                return aVersion.releaseCandidateIndex > bVersion.releaseCandidateIndex;
            }
            return aVersion.commitIndex > bVersion.commitIndex;
        }
    }

    if (aVersion.type === "beta") {
        switch (bVersion.type) {
            case "release":
            case "post-release-commit":
            case "rc":
            case "post-rc-commit":
                return false;
            case "alpha":
                return true;
        }

        return aVersion.index > bVersion.index;
    }

    if (aVersion.type === "alpha") {
        switch (bVersion.type) {
            case "release":
            case "post-release-commit":
            case "rc":
            case "post-rc-commit":
                return false;
        }

        return aVersion.index > bVersion.index;
    }

    // if here, 'a' is a post-rc-commit and 'b' is not, so just recursively run
    // to avoid duplicate logic
    return !isVersionAhead(b, a);
}

function getReleaseVersion(version: ParsedVersion): string {
    return `${version.major}.${version.minor}.${version.patch}`;
}
