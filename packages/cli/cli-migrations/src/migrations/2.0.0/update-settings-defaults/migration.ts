import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "update-2_0_0-defaults",
    summary: `The default of 'coerce-enums-to-literals' has changed from true to false. 
This migration will explicitly set it to true to maintain backwards compatibility.`,
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
        context.failAndThrow("generators.yml not found");
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

    if ("api-settings" in generatorsYmlContents && typeof generatorsYmlContents["api-settings"] === "object") {
        const apiSettings = generatorsYmlContents["api-settings"] as Record<string, unknown>;
        setCoerceEnumsToLiteralsDeprecated(apiSettings, context);
    }

    if ("api" in generatorsYmlContents) {
        if (generatorsYmlContents.api == null) {
            return;
        }

        if (Array.isArray(generatorsYmlContents.api)) {
            const api = generatorsYmlContents.api;
            for (const oldSpecKey in api) {
                let oldSpec = api[oldSpecKey];
                if (typeof oldSpec === "string") {
                    oldSpec = {
                        path: oldSpec
                    };
                    api[oldSpecKey] = oldSpec;
                }
                if ("proto" in oldSpec) {
                    continue;
                }
                if (oldSpec.settings == null) {
                    oldSpec.settings = {};
                }
                setCoerceEnumsToLiteralsDeprecated(oldSpec.settings, context);
            }
        } else if (typeof generatorsYmlContents.api == "object") {
            if ("namespaces" in generatorsYmlContents.api) {
                const namespaces = generatorsYmlContents.api.namespaces as Record<string, unknown>;
                for (const [namespace, namespaceConfig] of Object.entries(namespaces)) {
                    if (Array.isArray(namespaceConfig)) {
                        for (const oldSpecKey in namespaceConfig) {
                            let oldSpec = namespaceConfig[oldSpecKey];
                            if (typeof oldSpec === "string") {
                                oldSpec = {
                                    path: oldSpec
                                };
                            }
                            if ("proto" in oldSpec) {
                                continue;
                            }
                            if (oldSpec.settings == null) {
                                oldSpec.settings = {};
                            }
                            setCoerceEnumsToLiteralsDeprecated(oldSpec.settings, context);
                        }
                    } else if (typeof namespaceConfig === "object" && namespaceConfig != null) {
                        if ("proto" in namespaceConfig) {
                            continue;
                        }
                        const namespaceConfigObj = namespaceConfig as {
                            settings?: Record<string, unknown>;
                        };
                        if (namespaceConfigObj.settings == null) {
                            namespaceConfigObj.settings = {};
                        }
                        setCoerceEnumsToLiteralsDeprecated(namespaceConfigObj.settings, context);
                    } else if (typeof namespaceConfig === "string") {
                        const newConfig: { path: string; settings?: Record<string, unknown> } = {
                            path: namespaceConfig
                        };
                        namespaces[namespace] = newConfig;
                        if (newConfig.settings == null) {
                            newConfig.settings = {};
                        }
                        setCoerceEnumsToLiteralsDeprecated(newConfig.settings, context);
                    } else {
                        context.logger.warn(`Namespace ${namespace} is not a valid type. Skipping...`);
                        continue;
                    }
                }
            } else if ("specs" in generatorsYmlContents.api) {
                if (Array.isArray(generatorsYmlContents.api.specs)) {
                    for (const spec of generatorsYmlContents.api.specs) {
                        if (typeof spec !== "object") {
                            continue;
                        }
                        if ("proto" in spec) {
                            continue;
                        }
                        if (spec.settings == null) {
                            spec.settings = {} as Record<string, unknown>;
                        }
                        if ("asyncapi" in spec) {
                            setCoerceEnumsToLiteralsForSpec(spec.settings, context);
                            continue;
                        }
                        if ("openapi" in spec) {
                            setCoerceEnumsToLiteralsForSpec(spec.settings, context);
                            continue;
                        }
                    }
                }
            } else {
                const apiObj = generatorsYmlContents.api as { settings?: Record<string, unknown> };
                if (apiObj.settings == null) {
                    apiObj.settings = {};
                }

                setCoerceEnumsToLiteralsDeprecated(apiObj.settings, context);
            }
        } else if (typeof generatorsYmlContents.api === "string") {
            const newConfig: { path: string; settings?: Record<string, unknown> } = {
                path: generatorsYmlContents.api
            };
            if (newConfig.settings == null) {
                newConfig.settings = {};
            }
            setCoerceEnumsToLiteralsDeprecated(newConfig.settings, context);
        }
    }

    if ("openapi" in generatorsYmlContents) {
        const api = generatorsYmlContents.openapi;
        if (typeof api === "object") {
            const openApiSpec = api as { settings?: Record<string, unknown> };
            if (openApiSpec.settings == null) {
                openApiSpec.settings = {};
            }
            setCoerceEnumsToLiteralsDeprecated(openApiSpec.settings, context);
        }
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

function setCoerceEnumsToLiteralsDeprecated(settings: Record<string, unknown>, context: TaskContext): void {
    if ("coerce-enums-to-literals" in settings) {
        // if explicitly set, keep as is
        return;
    }

    context.logger.info("Setting 'coerce-enums-to-literals' to 'true' to maintain backwards compatibility.");
    settings["coerce-enums-to-literals"] = true;
}

function setCoerceEnumsToLiteralsForSpec(settings: Record<string, unknown>, context: TaskContext): void {
    if ("coerce-enums-to-literals" in settings) {
        // if explicitly set, keep as is
        return;
    }

    context.logger.info("Setting 'coerce-enums-to-literals' to 'true' to maintain backwards compatibility.");
    settings["coerce-enums-to-literals"] = true;
}
