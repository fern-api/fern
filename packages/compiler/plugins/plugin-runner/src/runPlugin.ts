import { runDocker } from "@fern-api/docker-utils";
import { writeFile } from "fs/promises";
import path from "path";
import { getPluginConfig } from "./getPluginConfig";
import { PluginHelpers } from "./PluginConfig";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const DOCKER_PLUGIN_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, "config.json");
const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, "ir.json");

export declare namespace runPlugin {
    export interface Args {
        imageName: string;
        pluginHelpers: PluginHelpers;
        customConfig: unknown;

        absolutePathToIr: string;
        absolutePathToOutput: string | undefined;
        absolutePathToProject: string | undefined;
        pathToWriteConfigJson: string;
    }
}

export async function runPlugin({
    imageName,
    absolutePathToOutput,
    absolutePathToIr,
    pathToWriteConfigJson,
    absolutePathToProject,
    pluginHelpers,
    customConfig,
}: runPlugin.Args): Promise<void> {
    const binds = [
        `${pathToWriteConfigJson}:${DOCKER_PLUGIN_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (absolutePathToOutput != null) {
        binds.push(`${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    const { config, binds: bindsForPlugins } = getPluginConfig({
        pluginHelpers,
        absolutePathToOutput,
        absolutePathToProject,
        customConfig,
    });
    binds.push(...bindsForPlugins);

    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds,
    });
}
