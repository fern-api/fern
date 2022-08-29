import { AbsoluteFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    draft: DraftGeneratorInvocation[];
    release: ReleaseGeneratorInvocation[];
}

export type GeneratorInvcation = DraftGeneratorInvocation | ReleaseGeneratorInvocation;

export interface DraftGeneratorInvocation extends BaseGeneratorInvocation {
    type: "draft";
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}

export interface ReleaseGeneratorInvocation extends BaseGeneratorInvocation {
    type: "release";
    outputs: GeneratorOutputs;
}

export interface BaseGeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
}

export interface GeneratorOutputs {
    npm: NpmGeneratorOutput | undefined;
    maven: MavenGeneratorOutput | undefined;
    github: GithubGeneratorOutput | undefined;
}

export interface NpmGeneratorOutput {
    url: string | undefined;
    packageName: string;
    token: string;
}

export interface MavenGeneratorOutput {
    url: string | undefined;
    coordinate: string;
    username: string;
    password: string;
}

export interface GithubGeneratorOutput {
    repository: string;
    token: string;
}
