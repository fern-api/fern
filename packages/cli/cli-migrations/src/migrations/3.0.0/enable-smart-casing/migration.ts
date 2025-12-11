import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "enable-smart-casing",
    summary: `Sets 'smart-casing: false' for existing generators to preserve backwards compatibility.
Starting with this version, smart-casing defaults to true for all generators. This migration
explicitly sets 'smart-casing: false' for generators that don't have it configured, ensuring
existing projects maintain their current naming behavior.`,
    run: async ({ context }) => {
        const absolutePathToFernDirectory = await getFernDirectory();
        if (absolutePathToFernDirectory == null) {
            context.failAndThrow("Fern directory not found. Failed to run migration");
            return;
        }

        const { files, directories } = await getFilesAndDirectories(absolutePathToFernDirectory);

        const apisDirectory = directories.find((dir) => dir.name === "apis");
        if (apisDirectory == null) {
            // Single workspaces
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
                    ...(await getFilesAndDirectories(join(absoluteFilepathToWorkspace)))
                });
            }
        }
    }
};

async function updateGeneratorsYml({ context, files }: { context: TaskContext; files: File[] }): Promise<void> {
    const generatorsYmlFile = files.find((file) => file.name === "generators.yml" || file.name === "generators.yaml");

    if (generatorsYmlFile == null) {
        // No generators.yml file, nothing to migrate
        return;
    }

    const generatorsYmlContents = yaml.load(generatorsYmlFile.contents);
    if (generatorsYmlContents == null) {
        return;
    }

    if (typeof generatorsYmlContents !== "object") {
        return;
    }

    let modified = false;

    // Traverse groups.*.generators[]
    if ("groups" in generatorsYmlContents && typeof generatorsYmlContents.groups === "object") {
        const groups = generatorsYmlContents.groups as Record<string, unknown>;
        for (const groupName of Object.keys(groups)) {
            const group = groups[groupName];
            if (typeof group !== "object" || group == null) {
                continue;
            }

            const groupObj = group as Record<string, unknown>;
            if (!("generators" in groupObj) || !Array.isArray(groupObj.generators)) {
                continue;
            }

            for (const generator of groupObj.generators) {
                if (typeof generator !== "object" || generator == null) {
                    continue;
                }

                const generatorObj = generator as Record<string, unknown>;
                const wasModified = setSmartCasingFalseIfNotConfigured(generatorObj, context);
                if (wasModified) {
                    modified = true;
                }
            }
        }
    }

    if (!modified) {
        context.logger.debug("No applicable generators found for smart-casing migration. Skipping...");
        return;
    }

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

/**
 * Sets smart-casing to false for generators that don't have it explicitly configured.
 * This preserves backwards compatibility as smart-casing now defaults to true.
 * Returns true if any modifications were made.
 */
function setSmartCasingFalseIfNotConfigured(generator: Record<string, unknown>, context: TaskContext): boolean {
    if ("smart-casing" in generator) {
        return false;
    }

    const generatorName = generator.name;
    if (typeof generatorName !== "string") {
        return false;
    }

    context.logger.info(`Setting 'smart-casing: false' for ${generatorName} to preserve backwards compatibility`);
    generator["smart-casing"] = false;
    return true;
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
