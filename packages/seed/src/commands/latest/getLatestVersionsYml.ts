import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

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

    const currentVersion = currentYaml[0]?.version;
    if (!currentVersion) {
        context.failWithoutThrowing("No version found in changelog");
        return undefined;
    }

    // If no previous file provided, return current version with hasNewVersion=true
    if (previousAbsolutePathToChangelog == null) {
        return {
            version: currentVersion,
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

    const previousVersion = previousYaml[0]?.version;
    if (!previousVersion) {
        context.failWithoutThrowing("No version found in previous changelog");
        return undefined;
    }

    // Compare versions
    const hasNewVersion = currentVersion !== previousVersion;

    return {
        version: currentVersion,
        hasNewVersion
    };
}
