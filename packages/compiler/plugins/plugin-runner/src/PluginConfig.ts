export interface PluginConfig {
    irFilepath: string;
    outputDirectory: string;
    helpers: PluginHelpers;
    customConfig: unknown;
}

export interface PluginHelpers {
    encodings: Record<string, string>;
}
