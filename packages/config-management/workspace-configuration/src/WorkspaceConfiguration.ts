import { AbsoluteFilePath } from "@fern-api/core-utils";

export interface WorkspaceConfiguration {
    // path to the workspace directory
    _absolutePath: AbsoluteFilePath;

    name: string;
    absolutePathToDefinition: AbsoluteFilePath;
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
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
}

export interface GeneratorHelper {
    name: string;
    version: string;
    absoluteLocationOnDisk: AbsoluteFilePath | undefined;
}
