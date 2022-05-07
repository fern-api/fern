export interface PluginConfig {
    irFilepath: string;
    output: PluginOutputConfig | undefined;
    helpers: PluginHelpers;
    customConfig: unknown;
}

export interface PluginOutputConfig {
    path: string;
    pathRelativeToRootOnHost: string | undefined;
}

export interface PluginHelpers {
    encodings: Record<string, string>;
}
