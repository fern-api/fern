export interface WorkspaceConfiguration {
    // path to the workspace directory
    _absolutePath: string;

    name: string;
    absolutePathToConfiguration: string;
    generators: GeneratorInvocation[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    generate: GenerateConfig | undefined;
    config: unknown;
    helpers: GeneratorHelper[];
}

export interface GenerateConfig {
    absolutePathToLocalOutput: string | undefined;
}

export interface GeneratorHelper {
    name: string;
    version: string;
    absoluteLocationOnDisk: string | undefined;
}
