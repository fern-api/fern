import path from "path";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_PATH_TO_IR, DOCKER_PLUGINS_DIRECTORY } from "./constants";
import { PluginConfig, PluginHelpers, PluginOutputConfig } from "./PluginConfig";

export declare namespace getPluginConfig {
    export interface Args {
        pluginHelpers: PluginHelpers;
        absolutePathToProject: string | undefined;
        absolutePathToOutput: string | undefined;
        customConfig: unknown;
    }

    export interface Return {
        config: PluginConfig;
        binds: string[];
    }
}

export function getPluginConfig({
    pluginHelpers,
    absolutePathToProject,
    absolutePathToOutput,
    customConfig,
}: getPluginConfig.Args): getPluginConfig.Return {
    const binds: string[] = [];

    // convert paths in helpers from host to docker
    const convertedHelpers: PluginConfig["helpers"] = {
        encodings: {},
    };
    for (const [encoding, helperForEncoding] of Object.entries(pluginHelpers.encodings)) {
        const absolutePathOnDocker = path.join(
            DOCKER_PLUGINS_DIRECTORY,
            helperForEncoding.name,
            helperForEncoding.version
        );
        convertedHelpers.encodings[encoding] = {
            name: helperForEncoding.name,
            version: helperForEncoding.version,
            absolutePath: absolutePathOnDocker,
        };
        binds.push(`${helperForEncoding.absolutePath}:${absolutePathOnDocker}:ro`);
    }

    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            output: getPluginOutputConfig({ absolutePathToProject, absolutePathToOutput }),
            customConfig,
            helpers: convertedHelpers,
        },
    };
}

// exported for testing
export function getPluginOutputConfig({
    absolutePathToProject,
    absolutePathToOutput,
}: {
    absolutePathToProject: string | undefined;
    absolutePathToOutput: string | undefined;
}): PluginOutputConfig | null {
    if (absolutePathToOutput == null) {
        return null;
    }

    return {
        path: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
        pathRelativeToRootOnHost:
            absolutePathToProject != null ? path.relative(absolutePathToProject, absolutePathToOutput) : null,
    };
}
