import { AbsoluteFilePath } from "@fern-api/core-utils";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    generators: GeneratorInvocation[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    generate: GenerateConfig | undefined;
    config: unknown;
}

export interface GenerateConfig {
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}
