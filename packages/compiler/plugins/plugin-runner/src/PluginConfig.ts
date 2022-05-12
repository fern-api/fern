// throughout these types, we're using null instead of undefined so we can
// validate the zod validator in fern-typescript at compiler time. (zod handles
// undefined by making the property optional, which we don't want to do.)

export interface PluginConfig<CustomConfig = unknown> {
    irFilepath: string;
    output: PluginOutputConfig | null;
    helpers: PluginHelpers;
    customConfig: CustomConfig;
}

export interface PluginOutputConfig {
    path: string;
    pathRelativeToRootOnHost: string | null;
}

export interface PluginHelpers {
    encodings: Record<string, PluginHelper>;
}

export interface PluginHelper {
    name: string;
    version: string;
    absolutePath: string;
}
