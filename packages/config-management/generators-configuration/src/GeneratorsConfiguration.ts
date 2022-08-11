export interface GeneratorsConfiguration {
    absolutePathToConfiguration: string;
    generators: GeneratorInvocation[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    generate: GenerateConfig | undefined;
    config: unknown;
}

export interface GenerateConfig {
    absolutePathToLocalOutput: string | undefined;
}
