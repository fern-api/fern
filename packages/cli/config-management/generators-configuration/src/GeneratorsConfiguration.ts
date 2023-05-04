import { Values } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    defaultGroup: string | undefined;
    groups: GeneratorGroup[];
}

export interface GeneratorGroup {
    groupName: string;
    audiences: GeneratorAudiences;
    generators: GeneratorInvocation[];
    docs: GeneratorGroupDocsConfiguration | undefined;
}

export type GeneratorAudiences = AllAudiences | SelectAudiences;

export interface AllAudiences {
    type: "all";
}

export interface SelectAudiences {
    type: "select";
    audiences: string[];
}

export interface GeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
    outputMode: FernFiddle.remoteGen.OutputMode;
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
    language: GenerationLanguage | undefined;
}

export const GenerationLanguage = {
    TYPESCRIPT: "typescript",
    JAVA: "java",
    PYTHON: "python",
} as const;

export type GenerationLanguage = Values<typeof GenerationLanguage>;

export interface GeneratorGroupDocsConfiguration {
    domain: string;
}
