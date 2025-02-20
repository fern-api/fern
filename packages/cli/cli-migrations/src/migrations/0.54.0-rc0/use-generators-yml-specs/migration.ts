import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import YAML from "yaml";

import { generatorsYml, getFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, Directory, File, RelativeFilePath, getDirectoryContents, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "generators-yml-use-api-specs",
    summary: "API specification must use the api.specs[] array syntax.",
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
            await addApiConfigurationToSingleWorkspace({
                context,
                files,
                directories,
                absolutePathToFernDirectory,
                absoluteFilepathToWorkspace: absolutePathToFernDirectory
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
                await addApiConfigurationToSingleWorkspace({
                    context,
                    ...(await getFilesAndDirectories(join(absoluteFilepathToWorkspace))),
                    absolutePathToFernDirectory,
                    absoluteFilepathToWorkspace
                });
            }
        }
    }
};

async function addApiConfigurationToSingleWorkspace({
    absolutePathToFernDirectory,
    absoluteFilepathToWorkspace,
    context,
    files,
    directories
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    absoluteFilepathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    files: File[];
    directories: Directory[];
}): Promise<void> {
    const specs: generatorsYml.SpecSchema[] = [];
    const generatorsYmlFile = files.find((file) => file.name === "generators.yml" || file.name === "generators.yaml");
    const openapiDirectory = directories.find((dir) => dir.name === "openapi");

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

    if ("api" in generatorsYmlContents) {
        if (generatorsYmlContents.api == null) {
            return;
        }

        if (Array.isArray(generatorsYmlContents.api)) {
            const api = generatorsYmlContents.api;
            for (const oldSpec of api) {
                const spec = await parseApiSpec({
                    oldSpec,
                    absolutePathToFernDirectory,
                    files,
                    context
                });
                if (spec) {
                    specs.push(spec);
                }
            }
        } else if (typeof generatorsYmlContents.api == "object") {
            if ("namespaces" in generatorsYmlContents.api) {
                const namespaces = generatorsYmlContents.api.namespaces as Record<string, unknown>;
                for (const [namespace, namespaceConfig] of Object.entries(namespaces)) {
                    if (Array.isArray(namespaceConfig)) {
                        for (const oldSpec of namespaceConfig) {
                            const spec = await parseApiSpec({
                                oldSpec,
                                absolutePathToFernDirectory,
                                files,
                                context,
                                namespace
                            });
                            if (spec) {
                                specs.push(spec);
                            }
                        }
                    } else if (typeof namespaceConfig === "string" || typeof namespaceConfig === "object") {
                        const spec = await parseApiSpec({
                            oldSpec: namespaceConfig,
                            absolutePathToFernDirectory,
                            files,
                            context,
                            namespace
                        });
                        if (spec) {
                            specs.push(spec);
                        }
                    } else {
                        context.logger.warn(`Namespace ${namespace} is not a valid type. Skipping...`);
                        continue;
                    }
                }
            } else {
                const spec = await parseApiSpec({
                    oldSpec: generatorsYmlContents.api,
                    absolutePathToFernDirectory,
                    files,
                    context
                });
                if (spec) {
                    specs.push(spec);
                }
            }
        } else {
            context.failAndThrow("API spec is not a valid YAML object or array");
            return;
        }
    }

    const rootSettings = getDeprecatedRootApiSettings(generatorsYmlContents);

    if ("openapi" in generatorsYmlContents) {
        const api = generatorsYmlContents.openapi as generatorsYml.GeneratorsOpenApiSchema;
        if (typeof api === "string") {
            specs.push({
                openapi: api,
                overrides:
                    "openapi-overrides" in generatorsYmlContents
                        ? (generatorsYmlContents["openapi-overrides"] as string)
                        : undefined,
                origin:
                    "spec-origin" in generatorsYmlContents
                        ? (generatorsYmlContents["spec-origin"] as string)
                        : undefined,
                settings: convertDeprecatedApiSettingsToOpenApiSettings(rootSettings)
            });
        } else if (typeof api === "object") {
            const openApiSpec = api as Partial<generatorsYml.GeneratorsOpenApiObjectSchema>;
            if (openApiSpec.path == null) {
                context.failAndThrow("openapi path is not defined");
                return;
            }
            specs.push({
                openapi: openApiSpec.path,
                overrides: openApiSpec.overrides,
                origin: openApiSpec.origin,
                settings: convertDeprecatedApiSettingsToOpenApiSettings(openApiSpec.settings ?? {})
            });
        } else {
            context.failAndThrow("openapi is not a string or object");
            return;
        }
    }

    if ("async-api" in generatorsYmlContents) {
        const api = generatorsYmlContents["async-api"];
        if (typeof api === "string") {
            specs.push({
                asyncapi: api,
                settings: convertDeprecatedApiSettingsToAsyncApiSettings(rootSettings)
            });
        } else {
            context.failAndThrow("async-api is not a string");
            return;
        }
    }

    const firstLine = generatorsYmlFile.contents.split("\n")[0];
    let schemaComment: string | undefined;
    if (firstLine?.startsWith("# yaml-language-server:")) {
        schemaComment = firstLine;
    }
    const parsedDocument = YAML.parseDocument(generatorsYmlFile.contents);
    parsedDocument.delete("api-settings");
    parsedDocument.delete("openapi");
    parsedDocument.delete("openapi-overrides");
    parsedDocument.delete("async-api");
    parsedDocument.delete("spec-origin");
    parsedDocument.delete("api");
    parsedDocument.setIn(["api", "specs"], specs);
    let documentToWrite = parsedDocument.toString();
    if (schemaComment && documentToWrite.indexOf(schemaComment) === -1) {
        documentToWrite = `${schemaComment}${documentToWrite}`;
    }
    await writeFile(generatorsYmlFile.absolutePath, documentToWrite);
    context.logger.info(chalk.green(`Updated ${generatorsYmlFile.absolutePath}`));
}

async function parseApiSpec({
    oldSpec,
    absolutePathToFernDirectory,
    files,
    context,
    namespace
}: {
    oldSpec: unknown;
    absolutePathToFernDirectory: AbsoluteFilePath;
    files: File[];
    context: TaskContext;
    namespace?: string;
}): Promise<generatorsYml.SpecSchema | null> {
    if (oldSpec == null) {
        context.logger.warn("API spec is null. Skipping...");
        return null;
    }

    if (typeof oldSpec !== "string" && typeof oldSpec !== "object") {
        context.logger.warn("API spec is not a string or object. Skipping...");
        return null;
    }
    if (typeof oldSpec === "string") {
        oldSpec = {
            path: oldSpec
        };
    }

    if (typeof oldSpec !== "object") {
        context.logger.warn("API spec is not an object. Skipping...");
        return null;
    }

    const spec = oldSpec as object;

    if ("proto" in spec) {
        if (typeof spec.proto !== "object") {
            context.logger.warn("API spec proto is not an object. Skipping...");
            return null;
        }
        return {
            proto: spec.proto as generatorsYml.ProtobufDefinitionSchema
        };
    }

    if (!("path" in spec)) {
        context.logger.warn("API spec does not have a path. Skipping...");
        return null;
    }
    if (typeof spec.path !== "string") {
        context.logger.warn("API spec path is not a string. Skipping...");
        return null;
    }

    const deprecatedApiSettings = getDeprecatedApiSettings(spec);

    const absoluteSpecPath = join(absolutePathToFernDirectory, RelativeFilePath.of(spec.path));
    const specFile = files.find((file) => file.absolutePath === absoluteSpecPath);
    if (specFile == null) {
        context.logger.warn(`API spec path ${absoluteSpecPath} does not exist. Skipping...`);
        return null;
    }
    const specYaml = yaml.load(specFile.contents);
    if (specYaml == null) {
        context.logger.warn(`API spec file ${spec.path} is null or undefined. Skipping...`);
        return null;
    }
    if (typeof specYaml !== "object") {
        context.logger.warn(`API spec file ${spec.path} is not a valid YAML object. Skipping...`);
        return null;
    }
    if ("asyncapi" in specYaml) {
        const asyncApi = spec as generatorsYml.ApiDefinitionWithOverridesSchema;
        return {
            asyncapi: asyncApi.path,
            overrides: asyncApi.overrides,
            namespace,
            origin: asyncApi.origin,
            settings: convertDeprecatedApiSettingsToAsyncApiSettings(deprecatedApiSettings)
        };
    } else if ("openapi" in specYaml) {
        const openApi = spec as generatorsYml.ApiDefinitionWithOverridesSchema;
        return {
            openapi: openApi.path,
            overrides: openApi.overrides,
            namespace,
            origin: openApi.origin,
            settings: convertDeprecatedApiSettingsToOpenApiSettings(deprecatedApiSettings)
        };
    } else {
        context.logger.warn(`API spec file ${spec.path} is not an OpenAPI or AsyncAPI spec. Skipping...`);
        return null;
    }
}

function getDeprecatedApiSettings(api: object): generatorsYml.ApiDefinitionSettingsSchema {
    if (!("settings" in api)) {
        return {};
    }
    return api.settings as generatorsYml.ApiDefinitionSettingsSchema;
}

function getDeprecatedRootApiSettings(root: object): generatorsYml.ApiDefinitionSettingsSchema {
    if (!("api-settings" in root)) {
        return {};
    }
    return root["api-settings"] as generatorsYml.ApiDefinitionSettingsSchema;
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

function convertDeprecatedApiSettingsToOpenApiSettings(
    deprecatedApiSettings: generatorsYml.ApiDefinitionSettingsSchema
): generatorsYml.OpenApiSettingsSchema {
    return {
        "idiomatic-request-names": deprecatedApiSettings["idiomatic-request-names"],
        "inline-path-parameters": deprecatedApiSettings["inline-path-parameters"],
        "only-include-referenced-schemas": deprecatedApiSettings["only-include-referenced-schemas"],
        "prefer-undiscriminated-unions-with-literals": deprecatedApiSettings?.unions === "v1" ? true : undefined,
        "respect-nullable-schemas": deprecatedApiSettings["respect-nullable-schemas"],
        "title-as-schema-name": deprecatedApiSettings["use-title"]
    };
}
function convertDeprecatedApiSettingsToAsyncApiSettings(
    deprecatedApiSettings: generatorsYml.ApiDefinitionSettingsSchema
): generatorsYml.AsyncApiSettingsSchema {
    return {
        "idiomatic-request-names": deprecatedApiSettings["idiomatic-request-names"],
        "respect-nullable-schemas": deprecatedApiSettings["respect-nullable-schemas"],
        "title-as-schema-name": deprecatedApiSettings["use-title"],
        "message-naming": deprecatedApiSettings["message-naming"]
    };
}
