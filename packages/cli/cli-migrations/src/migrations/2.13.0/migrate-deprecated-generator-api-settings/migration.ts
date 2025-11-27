import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "migrate-deprecated-generator-api-settings",
    summary: `Migrates deprecated generator-level API settings keys to their new equivalents:
  - 'use-title' -> 'title-as-schema-name'
  - 'unions: v1' -> 'prefer-undiscriminated-unions-with-literals: true'`,
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

    // Traverse groups.*.generators[].api.settings
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
                if (!("api" in generatorObj) || typeof generatorObj.api !== "object" || generatorObj.api == null) {
                    continue;
                }

                const apiObj = generatorObj.api as Record<string, unknown>;
                if (!("settings" in apiObj) || typeof apiObj.settings !== "object" || apiObj.settings == null) {
                    continue;
                }

                const settings = apiObj.settings as Record<string, unknown>;
                const wasModified = migrateDeprecatedSettings(settings, context);
                if (wasModified) {
                    modified = true;
                }
            }
        }
    }

    if (!modified) {
        context.logger.debug("No deprecated generator-level API settings found. Skipping...");
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
 * Migrates deprecated settings keys to their new equivalents.
 * Returns true if any modifications were made.
 */
function migrateDeprecatedSettings(settings: Record<string, unknown>, context: TaskContext): boolean {
    let modified = false;

    // use-title -> title-as-schema-name
    if ("use-title" in settings) {
        if (!("title-as-schema-name" in settings)) {
            settings["title-as-schema-name"] = settings["use-title"];
            context.logger.info("Migrating 'use-title' to 'title-as-schema-name'");
        }
        delete settings["use-title"];
        modified = true;
    }

    // unions: v1 -> prefer-undiscriminated-unions-with-literals: true
    if ("unions" in settings) {
        const unionsValue = settings["unions"];
        if (!("prefer-undiscriminated-unions-with-literals" in settings) && unionsValue === "v1") {
            settings["prefer-undiscriminated-unions-with-literals"] = true;
            context.logger.info("Migrating 'unions: v1' to 'prefer-undiscriminated-unions-with-literals: true'");
        }
        delete settings["unions"];
        modified = true;
    }

    return modified;
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
