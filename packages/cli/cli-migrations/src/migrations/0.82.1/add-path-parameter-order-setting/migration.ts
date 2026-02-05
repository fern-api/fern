import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "add-path-parameter-order-setting",
    summary: `Adds the 'path-parameter-order' setting to existing API configurations to maintain backwards compatibility.
This migration will set 'path-parameter-order: spec-order' in generators.yml files where it's not already specified.`,
    run: async ({ context }) => {
        const absolutePathToFernDirectory = await getFernDirectory();
        if (absolutePathToFernDirectory == null) {
            context.failAndThrow("Fern directory not found. Failed to run migration");
            return;
        }

        const { files, directories } = await getFilesAndDirectories(absolutePathToFernDirectory);

        const apisDirectory = directories.find((dir) => dir.name === "apis");
        if (apisDirectory == null) {
            // Single workspace
            await updateGeneratorsYml({
                context,
                files
            });
        } else {
            // Multiple workspaces
            for (const workspace of apisDirectory.contents) {
                if (workspace.type !== "directory") {
                    continue;
                }
                const absoluteFilepathToWorkspace = join(
                    absolutePathToFernDirectory,
                    RelativeFilePath.of("apis"),
                    RelativeFilePath.of(workspace.name)
                );
                await updateGeneratorsYml({
                    context,
                    ...(await getFilesAndDirectories(absoluteFilepathToWorkspace))
                });
            }
        }
    }
};

async function updateGeneratorsYml({ context, files }: { context: TaskContext; files: File[] }): Promise<void> {
    const generatorsYmlFile = files.find((file) => file.name === "generators.yml" || file.name === "generators.yaml");

    if (generatorsYmlFile == null) {
        context.logger.debug("generators.yml not found in this directory, skipping...");
        return;
    }

    const generatorsYmlContents = yaml.load(generatorsYmlFile.contents);
    if (generatorsYmlContents == null) {
        context.failAndThrow("generators.yml is null or undefined");
        return;
    }

    if (typeof generatorsYmlContents !== "object") {
        context.failAndThrow("generators.yml is not a valid YAML object");
        return;
    }

    let hasChanges = false;

    // Handle api configuration
    if ("api" in generatorsYmlContents) {
        if (generatorsYmlContents.api == null) {
            return;
        }

        if (typeof generatorsYmlContents.api === "object") {
            const apiObj = generatorsYmlContents.api as {
                settings?: Record<string, unknown>;
            };

            // Handle top-level api settings (cascades to all specs)
            if (apiObj.settings == null) {
                apiObj.settings = {};
            }
            if (addPathParameterOrderSetting(apiObj.settings, context)) {
                hasChanges = true;
            }
        }
    }

    // Handle OpenAPI configuration (if exists)
    if ("openapi" in generatorsYmlContents) {
        const api = generatorsYmlContents.openapi;
        if (typeof api === "object" && api != null) {
            const openApiSpec = api as { settings?: Record<string, unknown> };
            if (openApiSpec.settings == null) {
                openApiSpec.settings = {};
            }
            if (addPathParameterOrderSetting(openApiSpec.settings, context)) {
                hasChanges = true;
            }
        }
    }

    // Only write back if there were changes
    if (!hasChanges) {
        context.logger.debug(`No changes needed for ${generatorsYmlFile.absolutePath}`);
        return;
    }

    // Preserve schema comment if it exists
    const firstLine = generatorsYmlFile.contents.split("\n")[0];
    let schemaComment: string | undefined;
    if (firstLine?.startsWith("# yaml-language-server:")) {
        schemaComment = firstLine;
    }

    let documentToWrite = yaml.dump(generatorsYmlContents);
    if (schemaComment && documentToWrite.indexOf(schemaComment) === -1) {
        documentToWrite = `${schemaComment}\n${documentToWrite}`;
    }

    await writeFile(generatorsYmlFile.absolutePath, documentToWrite);
    context.logger.info(chalk.green(`Updated ${generatorsYmlFile.absolutePath}`));
}

async function getFilesAndDirectories(
    absoluteFilepath: AbsoluteFilePath
): Promise<{ files: File[]; directories: Directory[] }> {
    const contents = await getDirectoryContents(absoluteFilepath);

    const files: File[] = [];
    const directories: Directory[] = [];
    for (const fileOrFolder of contents) {
        if (fileOrFolder.type === "directory") {
            directories.push(fileOrFolder);
        } else {
            files.push(fileOrFolder);
        }
    }

    return { files, directories };
}

/**
 * Adds the path-parameter-order setting to the provided settings object if it doesn't already exist.
 * @param settings The settings object to modify
 * @param context The task context for logging
 * @returns true if changes were made, false otherwise
 */
function addPathParameterOrderSetting(settings: Record<string, unknown>, context: TaskContext): boolean {
    const SETTING_KEY = "path-parameter-order";
    const SETTING_VALUE = "spec-order";

    if (SETTING_KEY in settings) {
        // Already explicitly set, don't override
        context.logger.debug(`'${SETTING_KEY}' already set to '${settings[SETTING_KEY]}', skipping...`);
        return false;
    }

    context.logger.info(`Setting '${SETTING_KEY}' to '${SETTING_VALUE}' to maintain backwards compatibility.`);
    settings[SETTING_KEY] = SETTING_VALUE;
    return true;
}
