/*
 * (c) Copyright 2025 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AutoVersioningException } from "./AutoVersioningService";

export const AUTO_VERSION = "AUTO";
export const MAGIC_VERSION = "505.503.4455";

export enum VersionBump {
    MAJOR = "MAJOR",
    MINOR = "MINOR",
    PATCH = "PATCH",
    NO_CHANGE = "NO_CHANGE"
}

const SEMVER_PATTERN = /^(v)?(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;

/**
 * Checks if the given version string is the AUTO version indicator.
 */
export function isAutoVersion(version: string): boolean {
    return AUTO_VERSION === version;
}

/**
 * Increments a semantic version based on the version bump type.
 *
 * @param currentVersion The current version (e.g., "1.2.3" or "v1.2.3")
 * @param versionBump The type of version bump (MAJOR, MINOR, PATCH)
 * @return The incremented version
 * @throws AutoVersioningException if version parsing fails or unknown bump type
 */
export function incrementVersion(currentVersion: string, versionBump: VersionBump): string {
    const matcher = currentVersion.match(SEMVER_PATTERN);
    if (!matcher) {
        console.error(`Failed to parse version: ${currentVersion}`);
        throw new AutoVersioningException("Invalid semantic version format: " + currentVersion);
    }

    const prefix = matcher[1] || "";
    let major = parseInt(matcher[2] ?? "0", 10);
    let minor = parseInt(matcher[3] ?? "0", 10);
    let patch = parseInt(matcher[4] ?? "0", 10);
    const preRelease = matcher[5];
    const buildMetadata = matcher[6];

    let preserveMetadata = false;

    if (versionBump === VersionBump.MAJOR) {
        major++;
        minor = 0;
        patch = 0;
    } else if (versionBump === VersionBump.MINOR) {
        minor++;
        patch = 0;
    } else if (versionBump === VersionBump.PATCH) {
        patch++;
    } else if (versionBump === VersionBump.NO_CHANGE) {
        preserveMetadata = true;
    } else {
        console.error(`Unknown version bump type: ${versionBump}`);
        throw new AutoVersioningException("Unknown version bump type: " + versionBump);
    }

    let newVersion = `${prefix}${major}.${minor}.${patch}`;

    if (preserveMetadata) {
        if (preRelease) {
            newVersion += `-${preRelease}`;
        }

        if (buildMetadata) {
            newVersion += `+${buildMetadata}`;
        }
    }

    console.log(`Incremented version from ${currentVersion} to ${newVersion} (bump type: ${versionBump})`);
    return newVersion;
}

/**
 * Extracts the previous version from a line containing the magic version.
 * Assumes the line format is like: "version = '505.503.4455'" or "version: 505.503.4455"
 *
 * @param lineWithMagicVersion A line from git diff containing the magic version
 * @return The inferred previous version if found
 * @throws AutoVersioningException if no valid version can be extracted
 */
export function extractPreviousVersionFromDiffLine(lineWithMagicVersion: string): string {
    const prevVersionPattern = /[-].*?([v]?\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)/;
    const matcher = lineWithMagicVersion.match(prevVersionPattern);

    if (matcher && matcher[1]) {
        const version = matcher[1];
        console.log(`Extracted previous version from diff: ${version}`);
        return version;
    }

    throw new AutoVersioningException("Could not extract previous version from diff line: " + lineWithMagicVersion);
}
