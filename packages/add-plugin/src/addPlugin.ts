import { PluginInvocationSchema, WorkspaceDefinitionSchema } from "@fern-api/compiler-commons";

const JAVA_PLUGIN_NAME = "fernapi/fern-java";
const TYPESCRIPT_PLUGIN_NAME = "fernapi/fern-typescript";
const POSTMAN_PLUGIN_NAME = "fernapi/fern-postman";

export function addJavaPlugin(workspaceDefinition: WorkspaceDefinitionSchema): WorkspaceDefinitionSchema {
    return addPluginIfNotPresent(workspaceDefinition, JAVA_PLUGIN_NAME, getJavaPluginConfigSchema);
}

export function addTypescriptPlugin(workspaceDefinition: WorkspaceDefinitionSchema): WorkspaceDefinitionSchema {
    return addPluginIfNotPresent(workspaceDefinition, TYPESCRIPT_PLUGIN_NAME, getTypescriptPluginConfigSchema);
}

export function addPostmanPlugin(workspaceDefinition: WorkspaceDefinitionSchema): WorkspaceDefinitionSchema {
    return addPluginIfNotPresent(workspaceDefinition, POSTMAN_PLUGIN_NAME, getPostmanPluginConfigSchema);
}

function addPluginIfNotPresent(
    workspaceDefinition: WorkspaceDefinitionSchema,
    pluginName: string,
    getDefaultPluginInvocationSchema: () => PluginInvocationSchema
): WorkspaceDefinitionSchema {
    const pluginInstalled =
        workspaceDefinition.plugins != null
            ? workspaceDefinition.plugins.some((plugin) => plugin.name === pluginName)
            : workspaceDefinition.generators?.some((plugin) => plugin.name === pluginName);
    if (!pluginInstalled) {
        if (workspaceDefinition.plugins != null) {
            return {
                ...workspaceDefinition,
                plugins: [...workspaceDefinition.plugins, getDefaultPluginInvocationSchema()],
            };
        } else if (workspaceDefinition.generators != null) {
            return {
                ...workspaceDefinition,
                generators: [...workspaceDefinition.generators, getDefaultPluginInvocationSchema()],
            };
        } else {
            throw new Error("Neither plugins or generators were specified!");
        }
    }
    return workspaceDefinition;
}

function getJavaPluginConfigSchema(): PluginInvocationSchema {
    return {
        name: JAVA_PLUGIN_NAME,
        version: "0.0.30",
        output: "generated-java",
        config: {
            packagePrefix: "com",
            mode: "client_and_server",
        },
    };
}

function getTypescriptPluginConfigSchema(): PluginInvocationSchema {
    return {
        name: TYPESCRIPT_PLUGIN_NAME,
        version: "0.0.71",
        output: "generated-typescript",
        config: {
            mode: "client",
        },
    };
}

function getPostmanPluginConfigSchema(): PluginInvocationSchema {
    return {
        name: POSTMAN_PLUGIN_NAME,
        version: "0.0.3",
        output: "generated-postman",
    };
}
