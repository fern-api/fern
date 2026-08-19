import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import semver from "semver";

export interface LatestVersionResult {
    version: string;
    hasNewVersion: boolean;
}

export async function getLatestVersionsYml({
    absolutePathToChangelog,
    previousAbsolutePathToChangelog,
    context
}: {
    absolutePathToChangelog: AbsoluteFilePath;
    previousAbsolutePathToChangelog?: AbsoluteFilePath;
    context: TaskContext;
}): Promise<LatestVersionResult | undefined> {
    // Check if current file exists
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.failWithoutThrowing(`Changelog does not exist at path ${absolutePathToChangelog}`);
        return undefined;
    }

    // Read and parse current versions.yml
    const currentContent = await readFile(absolutePathToChangelog, "utf-8");
    const currentYaml = yaml.load(currentContent);

    if (!Array.isArray(currentYaml) || currentYaml.length === 0) {
        context.failWithoutThrowing("Changelog file is empty or not an array");
        return undefined;
    }

    // Collect all versions from current file
    const currentVersions = new Set<string>();
    for (const entry of currentYaml) {
        if (entry?.version) {
            currentVersions.add(entry.version);
        }
    }

    if (currentVersions.size === 0) {
        context.failWithoutThrowing("No versions found in changelog");
        return undefined;
    }

    // If no previous file provided, return the highest semver version
    if (previousAbsolutePathToChangelog == null) {
        const latestVersion = getHighestSemverVersion(Array.from(currentVersions));
        if (latestVersion == null) {
            context.failWithoutThrowing("No valid semver versions found in changelog");
            return undefined;
        }
        return {
            version: latestVersion,
            hasNewVersion: true
        };
    }

    // Check if previous file exists
    if (!(await doesPathExist(previousAbsolutePathToChangelog))) {
        context.failWithoutThrowing(`Previous changelog does not exist at path ${previousAbsolutePathToChangelog}`);
        return undefined;
    }

    // Read and parse previous versions.yml
    const previousContent = await readFile(previousAbsolutePathToChangelog, "utf-8");
    const previousYaml = yaml.load(previousContent);

    if (!Array.isArray(previousYaml) || previousYaml.length === 0) {
        context.failWithoutThrowing("Previous changelog file is empty or not an array");
        return undefined;
    }

    // Collect all versions from previous file
    const previousVersions = new Set<string>();
    for (const entry of previousYaml) {
        if (entry?.version) {
            previousVersions.add(entry.version);
        }
    }

    // Get versions not in the previous version file
    const newVersions = Array.from(currentVersions).filter((version) => !previousVersions.has(version));

    // If no new versions, return the highest version from current file
    if (newVersions.length === 0) {
        const latestVersion = getHighestSemverVersion(Array.from(currentVersions));
        if (latestVersion == null) {
            context.failWithoutThrowing("No valid semver versions found in changelog");
            return undefined;
        }
        return {
            version: latestVersion,
            hasNewVersion: false
        };
    }

    // Sort the new versions by semantic version and return the largest
    const latestNewVersion = getHighestSemverVersion(newVersions);
    if (latestNewVersion == null) {
        context.failWithoutThrowing("No valid semver versions found in new versions");
        return undefined;
    }

    return {
        version: latestNewVersion,
        hasNewVersion: true
    };
}

/**
 * Returns the highest semantic version from an array of version strings.
 * Returns undefined if no valid semver versions are found.
 */
function getHighestSemverVersion(versions: string[]): string | undefined {
    return (
        versions
            .map((ver) => semver.parse(ver))
            .filter((ver): ver is semver.SemVer => ver != null)
            // Compare semantic versions to get the largest version
            // We negate the number to get the largest version first
            .sort((a, b) => -a.compare(b))[0]
            ?.toString()
    );
}
