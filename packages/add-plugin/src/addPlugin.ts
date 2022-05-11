import { PluginInvocationSchema, WorkspaceDefinitionSchema } from "@fern-api/compiler-commons";

const JAVA_PLUGIN_NAME = "fernapi/fern-java";
const TYPESCRIPT_PLUGIN_NAME = "fernapi/fern-typescript";

export function addJavaPlugin(workspaceDefinition: WorkspaceDefinitionSchema): WorkspaceDefinitionSchema {
    return addPluginIfNotPresent(workspaceDefinition, JAVA_PLUGIN_NAME, getJavaPluginConfigSchema);
}

export function addTypescriptPlugin(workspaceDefinition: WorkspaceDefinitionSchema): WorkspaceDefinitionSchema {
    return addPluginIfNotPresent(workspaceDefinition, TYPESCRIPT_PLUGIN_NAME, getTypescriptPluginConfigSchema);
}

function addPluginIfNotPresent(
    workspaceDefinition: WorkspaceDefinitionSchema,
    pluginName: string,
    getDefaultPluginInvocationSchema: () => PluginInvocationSchema
): WorkspaceDefinitionSchema {
    const pluginInstalled = workspaceDefinition.plugins.every((plugin) => plugin.name === pluginName);
    if (!pluginInstalled) {
        return {
            ...workspaceDefinition,
            plugins: [...workspaceDefinition.plugins, getDefaultPluginInvocationSchema()],
        };
    }
    return workspaceDefinition;
}

function getJavaPluginConfigSchema(): PluginInvocationSchema {
    return {
        name: JAVA_PLUGIN_NAME,
        version: "0.0.24",
        output: "generated-java",
        config: {
            packagePrefix: "com",
            mode: "CLIENT_AND_SERVER",
        },
    };
}

function getTypescriptPluginConfigSchema(): PluginInvocationSchema {
    return {
        name: TYPESCRIPT_PLUGIN_NAME,
        version: "0.0.55",
        output: "generated-typescript",
        config: {
            mode: "client",
        },
    };
}
