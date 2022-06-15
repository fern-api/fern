import path from "path";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_GENERATORS_DIRECTORY, DOCKER_PATH_TO_IR } from "./constants";
import { GeneratorConfig, GeneratorHelpers, GeneratorOutputConfig } from "./GeneratorConfig";

export declare namespace getGeneratorConfig {
    export interface Args {
        helpers: GeneratorHelpers;
        absolutePathToProject: string | undefined;
        absolutePathToOutput: string | undefined;
        customConfig: unknown;
        workspaceVersion: string;
    }

    export interface Return {
        config: GeneratorConfig;
        binds: string[];
    }
}

export function getGeneratorConfig({
    helpers,
    absolutePathToProject,
    absolutePathToOutput,
    customConfig,
    workspaceVersion,
}: getGeneratorConfig.Args): getGeneratorConfig.Return {
    const binds: string[] = [];

    // convert paths in helpers from host to docker
    const convertedHelpers: GeneratorConfig["helpers"] = {
        encodings: {},
    };
    for (const [encoding, helperForEncoding] of Object.entries(helpers.encodings)) {
        const absolutePathOnDocker = path.join(
            DOCKER_GENERATORS_DIRECTORY,
            helperForEncoding.name,
            helperForEncoding.version
        );
        convertedHelpers.encodings[encoding] = {
            name: helperForEncoding.name,
            version: helperForEncoding.version,
            absolutePath: absolutePathOnDocker,
        };
        binds.push(`${helperForEncoding.absolutePath}:${absolutePathOnDocker}`);
    }

    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            workspaceVersion,
            output: getGeneratorOutputConfig({ absolutePathToProject, absolutePathToOutput }),
            customConfig,
            helpers: convertedHelpers,
        },
    };
}

// exported for testing
export function getGeneratorOutputConfig({
    absolutePathToProject,
    absolutePathToOutput,
}: {
    absolutePathToProject: string | undefined;
    absolutePathToOutput: string | undefined;
}): GeneratorOutputConfig | null {
    if (absolutePathToOutput == null) {
        return null;
    }

    return {
        path: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
        pathRelativeToRootOnHost:
            absolutePathToProject != null ? path.relative(absolutePathToProject, absolutePathToOutput) : null,
    };
}
