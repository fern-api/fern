// throughout these types, we're using null instead of undefined so we can
// validate the zod validator in fern-typescript at compiler time. (zod handles
// undefined by making the property optional, which we don't want to do.)

export interface GeneratorConfig<CustomConfig = unknown> {
    irFilepath: string;
    output: GeneratorOutputConfig | null;
    helpers: GeneratorHelpers;
    customConfig: CustomConfig;
}

export interface GeneratorOutputConfig {
    path: string;
    pathRelativeToRootOnHost: string | null;
}

export interface GeneratorHelpers {
    encodings: Record<string, GeneratorHelperReference>;
}

export interface GeneratorHelperReference {
    name: string;
    version: string;
    absolutePath: string;
}
