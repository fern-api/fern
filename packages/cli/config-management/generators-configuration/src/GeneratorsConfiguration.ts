import { AbsoluteFilePath } from "@fern-api/core-utils";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export interface GeneratorsConfiguration {
    absolutePathToConfiguration: AbsoluteFilePath;
    rawConfiguration: GeneratorsConfigurationSchema;
    draft: DraftGeneratorInvocation[];
    release: ReleaseGeneratorInvocation[];
}

export type GeneratorInvocation = DraftGeneratorInvocation | ReleaseGeneratorInvocation;

export interface DraftGeneratorInvocation extends BaseGeneratorInvocation {
    type: "draft";
    mode: "publish" | "download-files";
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}

export interface ReleaseGeneratorInvocation extends BaseGeneratorInvocation {
    type: "release";
    publishing: NpmGeneratorPublishing | MavenGeneratorPublishing;
    github: GithubGeneratorOutput | undefined;
}

export interface BaseGeneratorInvocation {
    name: string;
    version: string;
    config: unknown;
}

export interface NpmGeneratorPublishing {
    type: "npm";
    url: string | undefined;
    packageName: string;
    token: string | undefined;
}

export interface MavenGeneratorPublishing {
    type: "maven";
    url: string | undefined;
    coordinate: string;
    username: string | undefined;
    password: string | undefined;
}

export interface GithubGeneratorOutput {
    repository: string;
}
