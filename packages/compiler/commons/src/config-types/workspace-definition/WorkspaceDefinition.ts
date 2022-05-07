export interface WorkspaceDefinition {
    name: string | undefined;
    absolutePathToInput: string;
    plugins: PluginInvocation[];
}

export interface PluginInvocation {
    name: string;
    version: string;
    absolutePathToOutput: string | undefined;
    config: unknown;
    helpers: PluginHelper[];
}

export interface PluginHelper {
    name: string;
    version: string;
}
