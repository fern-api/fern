import { Audiences } from "@fern-api/config-management-commons";
import { Values } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    absolutePathToOpenAPI: AbsoluteFilePath | undefined;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    absolutePathToAsyncAPI: AbsoluteFilePath | undefined;
    rawConfiguration: GeneratorsConfigurationSchema;
    defaultGroup: string | undefined;
    groups: GeneratorGroup[];
}

export interface GeneratorGroup {
    groupName: string;
    audiences: Audiences;
    generators: GeneratorInvocation[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
    outputMode: FernFiddle.remoteGen.OutputMode;
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
    specialCasing: boolean;
    disableExamples: boolean;
    language: GenerationLanguage | undefined;
}

export const GenerationLanguage = {
    TYPESCRIPT: "typescript",
    JAVA: "java",
    PYTHON: "python",
    GO: "go",
    RUBY: "ruby"
} as const;

export type GenerationLanguage = Values<typeof GenerationLanguage>;
