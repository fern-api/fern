// we're using null here instead of undefined so we can validate
// the zod validator in fern-typescript at compiler time

export interface PluginConfig {
    irFilepath: string;
    output: PluginOutputConfig | null;
    helpers: PluginHelpers;
    customConfig: unknown;
}

export interface PluginOutputConfig {
    path: string;
    pathRelativeToRootOnHost: string | null;
}

export interface PluginHelpers {
    encodings: Record<string, string>;
}
