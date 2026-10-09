import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration.js";

export const migration: Migration = {
    name: "disable-disambiguate-request-names",
    summary: `Sets 'disambiguate-request-names: false' for existing OpenAPI specs to preserve backwards compatibility.
Starting with version 4.106.1, generated request wrapper names that collide with component schema names
are disambiguated by replacing the "Request" suffix with "Body". This migration explicitly disables that
behavior so existing projects keep their current request wrapper names.`,
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
        return;
    }

    const generatorsYmlContents = yaml.load(generatorsYmlFile.contents);
    if (generatorsYmlContents == null || typeof generatorsYmlContents !== "object") {
        return;
    }

    let modified = false;

    const doc = generatorsYmlContents as Record<string, unknown>;

    // Handle api.specs.[].settings (modern format)
    if ("api" in doc && typeof doc.api === "object" && doc.api != null) {
        const api = doc.api as Record<string, unknown>;
        if ("specs" in api && Array.isArray(api.specs)) {
            for (const spec of api.specs) {
                if (typeof spec !== "object" || spec == null) {
                    continue;
                }
                const specObj = spec as Record<string, unknown>;
                // Only apply to OpenAPI specs
                if (!("openapi" in specObj)) {
                    continue;
                }
                if (!("settings" in specObj) || typeof specObj.settings !== "object" || specObj.settings == null) {
                    specObj.settings = {};
                }
                const settings = specObj.settings as Record<string, unknown>;
                if (!("disambiguate-request-names" in settings)) {
                    settings["disambiguate-request-names"] = false;
                    modified = true;
                }
            }
        }

        // Handle api.settings (deprecated top-level settings)
        if ("settings" in api && typeof api.settings === "object" && api.settings != null) {
            const settings = api.settings as Record<string, unknown>;
            if (!("disambiguate-request-names" in settings)) {
                settings["disambiguate-request-names"] = false;
                modified = true;
            }
        } else if (!("specs" in api)) {
            // If there's an api block but no specs and no settings, add settings
            if (!("settings" in api)) {
                api.settings = { "disambiguate-request-names": false };
                modified = true;
            }
        }
    }

    // Handle groups.*.generators[].api.settings (legacy per-generator settings)
    if ("groups" in doc && typeof doc.groups === "object" && doc.groups != null) {
        const groups = doc.groups as Record<string, unknown>;
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
                if (!("disambiguate-request-names" in settings)) {
                    settings["disambiguate-request-names"] = false;
                    modified = true;
                }
            }
        }
    }

    if (!modified) {
        context.logger.debug("No OpenAPI specs found for disambiguate-request-names migration. Skipping...");
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
