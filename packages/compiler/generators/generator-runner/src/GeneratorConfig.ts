// throughout these types, we're using null instead of undefined so we can
// validate the zod validator in fern-typescript at compiler time. (zod handles
// undefined by making the property optional, which we don't want to do.)

export interface GeneratorConfig<CustomConfig = unknown> {
    irFilepath: string;
    workspaceVersion: string;
    output: GeneratorOutputConfig | null;
    publish: GeneratorPublishConfig | null;
    helpers: GeneratorHelpers;
    customConfig: CustomConfig;
}

export interface GeneratorOutputConfig {
    path: string;
}

export interface GeneratorPublishConfig {
    registryUrl: string;
    registries: GeneratorRegistriesConfig;
}

export interface GeneratorRegistriesConfig {
    maven: MavenRegistryConfig;
    npm: NpmRegistryConfig;
}

export interface MavenRegistryConfig {
    username: string;
    password: string;
    group: string;
    artifactPrefix: string;
}

export interface NpmRegistryConfig {
    token: string;
    scope: string;
    packagePrefix: string;
}

export interface GeneratorHelpers {
    encodings: Record<string, GeneratorHelperReference>;
}

export interface GeneratorHelperReference {
    name: string;
    version: string;
    absolutePath: string;
}
