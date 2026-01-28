import { incrementVersion, VersionBump } from "@fern-api/local-workspace-runner";
import semver from "semver";

/**
 * Changelog entry type as defined in the schema
 */
export type ChangelogType = "fix" | "chore" | "feat" | "internal" | "break";

/**
 * Minimal changelog entry structure needed for version computation
 */
export interface MinimalChangelogEntry {
    type: ChangelogType;
    summary: string;
}

/**
 * Minimal version entry structure needed for version computation
 */
export interface MinimalVersionEntry {
    version?: string; // Optional - will be computed if missing
    changelogEntry: MinimalChangelogEntry[];
    irVersion: number;
    createdAt: string;
}

/**
 * Maps changelog entry types to semantic version bump types
 */
export function getVersionBumpFromChangelogType(changelogType: ChangelogType): VersionBump {
    switch (changelogType) {
        case "break":
            return VersionBump.MAJOR;
        case "feat":
            return VersionBump.MINOR;
        case "fix":
        case "chore":
        case "internal":
            return VersionBump.PATCH;
        default:
            // This should never happen due to type safety, but provide fallback
            return VersionBump.PATCH;
    }
}

/**
 * Determines the required version bump for a set of changelog entries.
 * Uses the highest priority bump among all entries:
 * MAJOR > MINOR > PATCH
 */
export function determineVersionBump(changelogEntries: MinimalChangelogEntry[]): VersionBump {
    if (changelogEntries.length === 0) {
        return VersionBump.NO_CHANGE;
    }

    let highestBump = VersionBump.PATCH;

    for (const entry of changelogEntries) {
        const entryBump = getVersionBumpFromChangelogType(entry.type);

        // Priority: MAJOR > MINOR > PATCH > NO_CHANGE
        if (entryBump === VersionBump.MAJOR) {
            highestBump = VersionBump.MAJOR;
            break; // Can't get higher than MAJOR
        } else if (entryBump === VersionBump.MINOR && highestBump === VersionBump.PATCH) {
            highestBump = VersionBump.MINOR;
        }
        // PATCH is the default, so no need to change if already PATCH
    }

    return highestBump;
}

/**
 * Computes the version for a version entry based on its changelog entries
 * and the previous version in the list.
 */
export function computeVersionFromChangelog(versionEntry: MinimalVersionEntry, previousVersion: string): string {
    // If version is explicitly provided, use it
    if (versionEntry.version != null && versionEntry.version.trim() !== "") {
        return versionEntry.version;
    }

    const versionBump = determineVersionBump(versionEntry.changelogEntry);

    if (versionBump === VersionBump.NO_CHANGE) {
        // If no changes, keep the same version (this shouldn't normally happen)
        return previousVersion;
    }

    return incrementVersion(previousVersion, versionBump);
}

/**
 * Processes a list of version entries and computes missing versions.
 * The list should be in reverse chronological order (newest first),
 * as is typical in versions.yml files.
 */
export function computeMissingVersions(
    versionEntries: MinimalVersionEntry[],
    initialVersion: string = "0.0.0"
): MinimalVersionEntry[] {
    if (versionEntries.length === 0) {
        return [];
    }

    // Work backwards through the list (from oldest to newest)
    const result = [...versionEntries];

    // Start with the oldest entry (last in the array)
    let currentVersion = initialVersion;

    // Find the last entry that has an explicit version to use as starting point
    for (let i = result.length - 1; i >= 0; i--) {
        const entry = result[i];
        if (entry && entry.version != null && entry.version.trim() !== "") {
            currentVersion = entry.version;

            // Compute versions for entries after this one
            for (let j = i - 1; j >= 0; j--) {
                const nextEntry = result[j];
                if (nextEntry && (nextEntry.version == null || nextEntry.version.trim() === "")) {
                    currentVersion = computeVersionFromChangelog(nextEntry, currentVersion);
                    nextEntry.version = currentVersion;
                } else if (nextEntry?.version) {
                    currentVersion = nextEntry.version;
                }
            }
            break;
        }
    }

    // If no explicit version was found, compute all versions from the initial version
    if (result.every((entry) => !entry?.version || entry.version.trim() === "")) {
        for (let i = result.length - 1; i >= 0; i--) {
            const entry = result[i];
            if (entry) {
                currentVersion = computeVersionFromChangelog(entry, currentVersion);
                entry.version = currentVersion;
            }
        }
    }

    return result;
}

/**
 * Validates that computed versions follow semantic versioning rules
 */
export function validateComputedVersionProgression(versionEntries: MinimalVersionEntry[]): string[] {
    const errors: string[] = [];

    for (let i = 0; i < versionEntries.length - 1; i++) {
        const current = versionEntries[i];
        const previous = versionEntries[i + 1];

        if (!current?.version || !previous?.version) {
            continue;
        }

        const currentSemVer = semver.parse(current.version);
        const previousSemVer = semver.parse(previous.version);

        if (!currentSemVer || !previousSemVer) {
            errors.push(`Invalid semver format: ${current.version} or ${previous.version}`);
            continue;
        }

        // Current should be greater than previous (since list is newest first)
        if (semver.lte(current.version, previous.version)) {
            errors.push(
                `Version regression detected: ${previous.version} -> ${current.version}. ` +
                    `Versions should progress forward in time.`
            );
        }
    }

    return errors;
}
