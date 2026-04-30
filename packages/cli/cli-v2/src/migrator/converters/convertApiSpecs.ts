import type { schemas } from "@fern-api/config";
import { APIS_DIRECTORY, DEFINITION_DIRECTORY, FERN_DIRECTORY, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir } from "fs/promises";
import type { MigratorWarning } from "../types/index.js";
import { convertOpenApiSpecSettings } from "./convertSettings.js";

export interface ConvertApiSpecsResult {
    specs: schemas.ApiSpecSchema[];
    warnings: MigratorWarning[];
}

export interface ConvertSingleApiOptions {
    /** The fern directory (e.g., /path/to/project/fern) */
    fernDir: AbsoluteFilePath;
    /** API config from generators.yml */
    generatorsYmlApi: generatorsYml.ApiConfigurationSchema | undefined;
}

export interface ConvertSingleApiResult {
    api: schemas.ApiDefinitionSchema | undefined;
    warnings: MigratorWarning[];
}

/**
 * Converts API configuration for a single-API project.
 * Checks for Fern definition directory (takes precedence) or uses generators.yml specs.
 */
export async function convertSingleApi(options: ConvertSingleApiOptions): Promise<ConvertSingleApiResult> {
    const { fernDir, generatorsYmlApi } = options;
    const warnings: MigratorWarning[] = [];

    const definitionDir = join(fernDir, RelativeFilePath.of(DEFINITION_DIRECTORY));
    const hasFernDefinition = await doesPathExist(definitionDir, "directory");

    if (hasFernDefinition) {
        // The Fern definition takes precedence.
        const api: schemas.ApiDefinitionSchema = {
            specs: [{ fern: `./${FERN_DIRECTORY}/${DEFINITION_DIRECTORY}` }]
        };

        if (generatorsYmlApi != null) {
            const generatorsSpecs = convertApiSpecs(generatorsYmlApi);
            warnings.push(...generatorsSpecs.warnings);

            if (generatorsSpecs.specs.length > 0) {
                warnings.push({
                    type: "info",
                    message: "Found both Fern definition directory and API specs in generators.yml",
                    suggestion:
                        "The Fern definition will be used. If you need to include other specs, you can configure multiple APIs with the 'apis' key."
                });
            }
        }

        return { api, warnings };
    }

    if (generatorsYmlApi != null) {
        const result = convertApiSpecs(generatorsYmlApi);
        warnings.push(...result.warnings);

        if (result.specs.length > 0) {
            return { api: { specs: result.specs }, warnings };
        }
    }

    return { api: undefined, warnings };
}

export interface ConvertMultiApiOptions {
    /** The fern directory (e.g., /path/to/project/fern) */
    fernDir: AbsoluteFilePath;
    /** The apis directory (e.g., /path/to/project/fern/apis) */
    apisDir: AbsoluteFilePath;
    /** Map of API name to generators.yml API config */
    generatorsYmlApis: Record<string, generatorsYml.ApiConfigurationSchema | undefined>;
}

export interface ConvertMultiApiResult {
    apis: schemas.ApisSchema;
    warnings: MigratorWarning[];
}

export async function convertMultiApi(options: ConvertMultiApiOptions): Promise<ConvertMultiApiResult> {
    const { apisDir, generatorsYmlApis } = options;
    const warnings: MigratorWarning[] = [];
    const apis: schemas.ApisSchema = {};

    const apiDirs = await readdir(apisDir, { withFileTypes: true });
    const apiNames = apiDirs.filter((d) => d.isDirectory()).map((d) => d.name);

    for (const apiName of apiNames) {
        const apiDir = join(apisDir, RelativeFilePath.of(apiName));
        const definitionDir = join(apiDir, RelativeFilePath.of(DEFINITION_DIRECTORY));
        const hasFernDefinition = await doesPathExist(definitionDir, "directory");

        const generatorsYmlApi = generatorsYmlApis[apiName];

        if (hasFernDefinition) {
            // The Fern definition takes precedence.
            apis[apiName] = {
                specs: [{ fern: `./${FERN_DIRECTORY}/${APIS_DIRECTORY}/${apiName}/${DEFINITION_DIRECTORY}` }]
            };

            if (generatorsYmlApi != null) {
                const generatorsSpecs = convertApiSpecs(generatorsYmlApi);
                warnings.push(...generatorsSpecs.warnings);

                if (generatorsSpecs.specs.length > 0) {
                    warnings.push({
                        type: "info",
                        message: `Found both Fern definition and API specs in generators.yml for '${apiName}'`,
                        suggestion: `The Fern definition will be used. Add other specs to apis.${apiName}.specs manually if needed.`
                    });
                }
            }
        } else if (generatorsYmlApi != null) {
            const result = convertApiSpecs(generatorsYmlApi);
            warnings.push(...result.warnings);
            if (result.specs.length > 0) {
                const adjustedSpecs = adjustSpecPaths(result.specs, apiName);
                apis[apiName] = { specs: adjustedSpecs };
            } else {
                apis[apiName] = { specs: [] };
                warnings.push({
                    type: "info",
                    message: `No API specs found for '${apiName}'`,
                    suggestion: `Add specs to apis.${apiName}.specs manually`
                });
            }
        } else {
            apis[apiName] = { specs: [] };
            warnings.push({
                type: "info",
                message: `No API specs found for '${apiName}'`,
                suggestion: `Add specs to apis.${apiName}.specs manually`
            });
        }
    }

    return { apis, warnings };
}

/**
 * Adjusts spec paths to be relative from the project root (where fern.yml is created).
 */
function adjustSpecPaths(specs: schemas.ApiSpecSchema[], apiName: string): schemas.ApiSpecSchema[] {
    return specs.map((spec) => {
        if ("openapi" in spec) {
            return {
                ...spec,
                openapi: adjustPath(spec.openapi, apiName),
                overrides: spec.overrides != null ? adjustPathOrPaths(spec.overrides, apiName) : undefined,
                overlays: spec.overlays != null ? adjustPath(spec.overlays, apiName) : undefined
            };
        }
        if ("asyncapi" in spec) {
            return {
                ...spec,
                asyncapi: adjustPath(spec.asyncapi, apiName),
                overrides: spec.overrides != null ? adjustPathOrPaths(spec.overrides, apiName) : undefined
            };
        }
        if ("fern" in spec) {
            return {
                ...spec,
                fern: adjustPath(spec.fern, apiName)
            };
        }
        if ("conjure" in spec) {
            return {
                ...spec,
                conjure: adjustPath(spec.conjure, apiName)
            };
        }
        if ("openrpc" in spec) {
            return {
                ...spec,
                openrpc: adjustPath(spec.openrpc, apiName),
                overrides: spec.overrides != null ? adjustPathOrPaths(spec.overrides, apiName) : undefined
            };
        }
        if ("graphql" in spec) {
            return {
                ...spec,
                graphql: adjustPath(spec.graphql, apiName),
                overrides: spec.overrides != null ? adjustPathOrPaths(spec.overrides, apiName) : undefined
            };
        }
        if ("proto" in spec) {
            return {
                ...spec,
                proto: {
                    ...spec.proto,
                    root: adjustPath(spec.proto.root, apiName),
                    overrides:
                        spec.proto.overrides != null ? adjustPathOrPaths(spec.proto.overrides, apiName) : undefined
                }
            };
        }
        return spec;
    });
}

function adjustPath(path: string, apiName: string): string {
    if (path.startsWith("/")) {
        return path;
    }
    if (path.startsWith("./")) {
        return `./${FERN_DIRECTORY}/${APIS_DIRECTORY}/${apiName}/${path.slice(2)}`;
    }
    return `./${FERN_DIRECTORY}/${APIS_DIRECTORY}/${apiName}/${path}`;
}

function adjustPathOrPaths(paths: string | string[], apiName: string): string | string[] {
    if (Array.isArray(paths)) {
        return paths.map((p) => adjustPath(p, apiName));
    }
    return adjustPath(paths, apiName);
}

/**
 * Converts legacy API configuration to new fern.yml api.specs format.
 */
export function convertApiSpecs(apiConfig: generatorsYml.ApiConfigurationSchema | undefined): ConvertApiSpecsResult {
    const warnings: MigratorWarning[] = [];
    if (apiConfig == null) {
        return { specs: [], warnings };
    }
    if (isApiConfigurationV2Schema(apiConfig)) {
        return convertV2Specs(apiConfig.specs, warnings);
    }
    if (isNamespacedApiConfiguration(apiConfig)) {
        return convertNamespacedSpecs(apiConfig, warnings);
    }
    return convertLegacyApiConfig(apiConfig, warnings);
}

function isApiConfigurationV2Schema(
    config: generatorsYml.ApiConfigurationSchema
): config is generatorsYml.ApiConfigurationV2Schema {
    return typeof config === "object" && config != null && "specs" in config && config.specs != null;
}

function isNamespacedApiConfiguration(
    config: generatorsYml.ApiConfigurationSchema
): config is generatorsYml.NamespacedApiConfigurationSchema {
    return typeof config === "object" && config != null && "namespaces" in config && config.namespaces != null;
}

function convertV2Specs(
    specs: generatorsYml.ApiConfigurationV2SpecsSchema,
    warnings: MigratorWarning[]
): ConvertApiSpecsResult {
    if (typeof specs === "string") {
        return {
            specs: [{ conjure: specs }],
            warnings
        };
    }
    if (!Array.isArray(specs) && "conjure" in specs) {
        return {
            specs: [{ conjure: specs.conjure }],
            warnings
        };
    }

    const convertedSpecs: schemas.ApiSpecSchema[] = [];
    for (const spec of specs as generatorsYml.SpecSchema[]) {
        const converted = convertSpec(spec, warnings);
        if (converted != null) {
            convertedSpecs.push(converted);
        }
    }

    return { specs: convertedSpecs, warnings };
}

function convertSpec(spec: generatorsYml.SpecSchema, warnings: MigratorWarning[]): schemas.ApiSpecSchema | undefined {
    if ("openapi" in spec) {
        const openApiSpec = spec as generatorsYml.OpenApiSpecSchema;
        const settingsResult = convertOpenApiSpecSettings(openApiSpec.settings as Record<string, unknown> | undefined);
        warnings.push(...settingsResult.warnings);

        const result: schemas.OpenApiSpecSchema = {
            openapi: openApiSpec.openapi
        };

        if (openApiSpec.origin != null) {
            result.origin = openApiSpec.origin;
        }
        if (openApiSpec.overrides != null) {
            result.overrides = openApiSpec.overrides;
        }
        if (openApiSpec.overlays != null) {
            result.overlays = openApiSpec.overlays;
        }
        if (openApiSpec.namespace != null) {
            result.namespace = openApiSpec.namespace;
        }
        if (Object.keys(settingsResult.settings).length > 0) {
            result.settings = settingsResult.settings;
        }

        return result;
    }
    if ("asyncapi" in spec) {
        const asyncApiSpec = spec as generatorsYml.AsyncApiSpecSchema;
        const settingsResult = convertOpenApiSpecSettings(asyncApiSpec.settings as Record<string, unknown> | undefined);
        warnings.push(...settingsResult.warnings);

        const result: schemas.AsyncApiSpecSchema = {
            asyncapi: asyncApiSpec.asyncapi
        };

        if (asyncApiSpec.origin != null) {
            result.origin = asyncApiSpec.origin;
        }
        if (asyncApiSpec.overrides != null) {
            result.overrides = asyncApiSpec.overrides;
        }
        if (asyncApiSpec.namespace != null) {
            result.namespace = asyncApiSpec.namespace;
        }
        if (Object.keys(settingsResult.settings).length > 0) {
            result.settings = settingsResult.settings;
        }

        return result;
    }
    if ("proto" in spec) {
        const protoSpec = spec as generatorsYml.ProtobufSpecSchema;
        const protoDef = protoSpec.proto;

        const result: schemas.ProtobufSpecSchema = {
            proto: {
                root: protoDef.root
            }
        };

        if (protoDef.target != null) {
            result.proto.target = protoDef.target;
        }
        if (protoDef.overrides != null) {
            result.proto.overrides = protoDef.overrides;
        }
        if (protoDef["local-generation"] != null) {
            result.proto.localGeneration = protoDef["local-generation"];
        }
        if (protoDef["from-openapi"] != null) {
            result.proto.fromOpenapi = protoDef["from-openapi"];
        }
        if (protoDef.dependencies != null) {
            result.proto.dependencies = protoDef.dependencies;
        }

        return result;
    }
    if ("openrpc" in spec) {
        const openRpcSpec = spec as generatorsYml.OpenRpcSpecSchema;

        const result: schemas.OpenRpcSpecSchema = {
            openrpc: openRpcSpec.openrpc
        };

        if (openRpcSpec.overrides != null) {
            result.overrides = openRpcSpec.overrides;
        }

        return result;
    }
    if ("graphql" in spec) {
        const graphqlSpec = spec as generatorsYml.GraphQlSpecSchema;

        const result: schemas.GraphQlSpecSchema = {
            graphql: graphqlSpec.graphql
        };

        if (graphqlSpec.origin != null) {
            result.origin = graphqlSpec.origin;
        }
        if (graphqlSpec.overrides != null) {
            result.overrides = graphqlSpec.overrides;
        }
        if (graphqlSpec.name != null) {
            result.name = graphqlSpec.name;
        }

        return result;
    }

    warnings.push({
        type: "unsupported",
        message: `Unknown spec type: ${JSON.stringify(Object.keys(spec))}`
    });

    return undefined;
}

function convertNamespacedSpecs(
    config: generatorsYml.NamespacedApiConfigurationSchema,
    warnings: MigratorWarning[]
): ConvertApiSpecsResult {
    const specs: schemas.ApiSpecSchema[] = [];

    for (const [namespace, nsConfig] of Object.entries(config.namespaces)) {
        const nsResult = convertLegacyApiConfig(nsConfig, warnings);
        for (const spec of nsResult.specs) {
            if ("openapi" in spec) {
                specs.push({ ...spec, namespace });
            } else if ("asyncapi" in spec) {
                specs.push({ ...spec, namespace });
            } else if ("graphql" in spec) {
                specs.push({ ...spec, name: spec.name ?? namespace });
            } else if ("fern" in spec) {
                // Fern specs don't have namespace in the schema, add warning.
                warnings.push({
                    type: "info",
                    message: `Namespace '${namespace}' for Fern spec cannot be set directly`,
                    suggestion: "Consider restructuring your API definitions"
                });
                specs.push(spec);
            } else {
                specs.push(spec);
            }
        }
    }

    return { specs, warnings };
}

function convertLegacyApiConfig(
    config: generatorsYml.ApiConfigurationSchemaInternal,
    warnings: MigratorWarning[]
): ConvertApiSpecsResult {
    const specs: schemas.ApiSpecSchema[] = [];

    if (typeof config === "string") {
        specs.push({ openapi: config });
        return { specs, warnings };
    }

    if (Array.isArray(config)) {
        for (const item of config) {
            const converted = convertApiDefinitionSchema(item, warnings);
            if (converted != null) {
                specs.push(converted);
            }
        }
        return { specs, warnings };
    }

    if ("proto" in config && config.proto != null) {
        const protoDef = config.proto;
        const result: schemas.ProtobufSpecSchema = {
            proto: {
                root: protoDef.root
            }
        };

        if (protoDef.target != null) {
            result.proto.target = protoDef.target;
        }
        if (protoDef.overrides != null) {
            result.proto.overrides = protoDef.overrides;
        }

        specs.push(result);
        return { specs, warnings };
    }

    if ("path" in config && config.path != null) {
        const settingsResult = convertOpenApiSpecSettings(config.settings as Record<string, unknown> | undefined);
        warnings.push(...settingsResult.warnings);

        const result: schemas.OpenApiSpecSchema = {
            openapi: config.path
        };

        if (config.origin != null) {
            result.origin = config.origin;
        }
        if (config.overrides != null) {
            result.overrides = config.overrides;
        }
        if (Object.keys(settingsResult.settings).length > 0) {
            result.settings = settingsResult.settings;
        }

        specs.push(result);
        return { specs, warnings };
    }

    warnings.push({
        type: "unsupported",
        message: `Unknown legacy API configuration format`
    });

    return { specs, warnings };
}

function convertApiDefinitionSchema(
    item: generatorsYml.ApiDefinitionSchema,
    warnings: MigratorWarning[]
): schemas.ApiSpecSchema | undefined {
    if (typeof item === "string") {
        return { openapi: item };
    }
    if ("path" in item && item.path != null) {
        const settingsResult = convertOpenApiSpecSettings(item.settings as Record<string, unknown> | undefined);
        warnings.push(...settingsResult.warnings);

        const result: schemas.OpenApiSpecSchema = {
            openapi: item.path
        };

        if (item.origin != null) {
            result.origin = item.origin;
        }
        if (item.overrides != null) {
            result.overrides = item.overrides;
        }
        if (Object.keys(settingsResult.settings).length > 0) {
            result.settings = settingsResult.settings;
        }

        return result;
    }

    return undefined;
}
