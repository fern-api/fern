import { getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "update-1_0_0-defaults",
    summary: `The defaults of the API spec settings have changed. 
This migration will explicitly set the old defaults to maintain backwards compatibility.`,
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
        setNewSettingsDefaultsDeprecated(apiSettings, context);
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
                setNewSettingsDefaultsDeprecated(oldSpec.settings, context);
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
                            setNewSettingsDefaultsDeprecated(oldSpec.settings, context);
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
                        setNewSettingsDefaultsDeprecated(namespaceConfigObj.settings, context);
                    } else if (typeof namespaceConfig === "string") {
                        const newConfig: { path: string; settings?: Record<string, unknown> } = {
                            path: namespaceConfig
                        };
                        namespaces[namespace] = newConfig;
                        if (newConfig.settings == null) {
                            newConfig.settings = {};
                        }
                        setNewSettingsDefaultsDeprecated(newConfig.settings, context);
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
                            setNewAsyncApiSpecSettingsDefaults(spec.settings, context);
                            continue;
                        }
                        if ("openapi" in spec) {
                            setNewOpenApiSpecSettingsDefaults(spec.settings, context);
                            continue;
                        }
                    }
                }
            } else {
                const apiObj = generatorsYmlContents.api as { settings?: Record<string, unknown> };
                if (apiObj.settings == null) {
                    apiObj.settings = {};
                }

                setNewSettingsDefaultsDeprecated(apiObj.settings, context);
            }
        } else if (typeof generatorsYmlContents.api === "string") {
            const newConfig: { path: string; settings?: Record<string, unknown> } = {
                path: generatorsYmlContents.api
            };
            if (newConfig.settings == null) {
                newConfig.settings = {};
            }
            setNewSettingsDefaultsDeprecated(newConfig.settings, context);
        }
    }

    if ("openapi" in generatorsYmlContents) {
        const api = generatorsYmlContents.openapi;
        if (typeof api === "object") {
            const openApiSpec = api as { settings?: Record<string, unknown> };
            if (openApiSpec.settings == null) {
                openApiSpec.settings = {};
            }
            setNewSettingsDefaultsDeprecated(openApiSpec.settings, context);
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

type NewSettingsDefaults = {
    [key: string]: [unknown, unknown];
};

const COMMON_SETTINGS_DEFAULTS: NewSettingsDefaults = {
    "respect-nullable-schemas": [false, true],
    "idiomatic-request-names": [false, true]
};

const OPENAPI_SETTINGS_DEFAULTS: NewSettingsDefaults = {
    "inline-path-parameters": [false, true]
};

const NEW_DEPRECATED_SETTINGS_DEFAULTS: NewSettingsDefaults = {
    "use-title": [true, false],
    ...COMMON_SETTINGS_DEFAULTS,
    ...OPENAPI_SETTINGS_DEFAULTS
};

const NEW_OPENAPI_SPEC_SETTINGS_DEFAULTS: NewSettingsDefaults = {
    "title-as-schema-name": [true, false],
    "type-dates-as-strings": [true, false],
    ...COMMON_SETTINGS_DEFAULTS,
    ...OPENAPI_SETTINGS_DEFAULTS
};

const NEW_ASYNCAPI_SPEC_SETTINGS_DEFAULTS: NewSettingsDefaults = {
    "title-as-schema-name": [true, false],
    ...COMMON_SETTINGS_DEFAULTS
};

function setNewSettingsDefaultsDeprecated(settings: Record<string, unknown>, context: TaskContext): void {
    return setNewSettingsDefaultsInternal(settings, NEW_DEPRECATED_SETTINGS_DEFAULTS, context);
}

function setNewAsyncApiSpecSettingsDefaults(settings: Record<string, unknown>, context: TaskContext): void {
    return setNewSettingsDefaultsInternal(settings, NEW_ASYNCAPI_SPEC_SETTINGS_DEFAULTS, context);
}

function setNewOpenApiSpecSettingsDefaults(settings: Record<string, unknown>, context: TaskContext): void {
    return setNewSettingsDefaultsInternal(settings, NEW_OPENAPI_SPEC_SETTINGS_DEFAULTS, context);
}

function setNewSettingsDefaultsInternal(
    settings: Record<string, unknown>,
    newDefaults: NewSettingsDefaults,
    context: TaskContext
): void {
    for (const settingKey in newDefaults) {
        const [oldDefault] = newDefaults[settingKey] as [unknown, unknown];
        if (settingKey in settings) {
            // if explicitly set, keep as is
            continue;
        }

        context.logger.info(`Setting '${settingKey}' to '${oldDefault}' to maintain backwards compatibility.`);
        settings[settingKey] = oldDefault;
    }
}
