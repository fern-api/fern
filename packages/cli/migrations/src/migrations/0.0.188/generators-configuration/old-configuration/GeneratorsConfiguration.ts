import { AbsoluteFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    pathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    generators: GeneratorInvocation[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    generate: GenerateConfig | undefined;
    config: unknown;
}

export interface GenerateConfig {
    pathToLocalOutput: AbsoluteFilePath | undefined;
}
