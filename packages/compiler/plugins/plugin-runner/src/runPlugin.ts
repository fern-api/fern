import { runDocker } from "@fern-api/docker-utils";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { PluginConfig, PluginHelpers } from "./PluginConfig";

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
        absolutePathToProjectConfig: string | undefined;
        pathToWriteConfigJson: string;
    }
}

export async function runPlugin({
    imageName,
    absolutePathToOutput,
    absolutePathToIr,
    pathToWriteConfigJson,
    absolutePathToProjectConfig,
    pluginHelpers,
    customConfig,
}: runPlugin.Args): Promise<void> {
    const config: PluginConfig = {
        irFilepath: DOCKER_PATH_TO_IR,
        output: null,
        helpers: pluginHelpers,
        customConfig,
    };

    const binds = [
        `${pathToWriteConfigJson}:${DOCKER_PLUGIN_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (absolutePathToOutput != null) {
        await rm(absolutePathToOutput, { force: true, recursive: true });
        binds.push(`${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
        config.output = {
            path: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
            pathRelativeToRootOnHost:
                absolutePathToProjectConfig != null
                    ? path.relative(absolutePathToProjectConfig, absolutePathToOutput)
                    : null,
        };
    }

    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds,
    });
}
