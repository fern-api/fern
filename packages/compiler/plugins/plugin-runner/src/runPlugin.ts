import { PluginInvocation } from "@fern-api/compiler-commons";
import { runDocker } from "@fern-api/docker-utils";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { PluginConfig } from "./PluginConfig";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const DOCKER_PLUGIN_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, "config.json");
const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, "ir.json");

export declare namespace runPlugin {
    export interface Args {
        pluginInvocation: PluginInvocation;
        absolutePathToIr: string;
        pathToWriteConfigJson: string;
        absolutePathToProjectConfig: string | undefined;
    }
}

export async function runPlugin({
    pluginInvocation,
    absolutePathToIr,
    pathToWriteConfigJson,
    absolutePathToProjectConfig,
}: runPlugin.Args): Promise<void> {
    const config: PluginConfig = {
        irFilepath: DOCKER_PATH_TO_IR,
        output: null,
        helpers: {
            encodings: {},
        },
        customConfig: pluginInvocation.config,
    };

    const binds = [
        `${pathToWriteConfigJson}:${DOCKER_PLUGIN_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (pluginInvocation.absolutePathToOutput != null) {
        await rm(pluginInvocation.absolutePathToOutput, { force: true, recursive: true });
        binds.push(`${pluginInvocation.absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
        config.output = {
            path: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
            pathRelativeToRootOnHost:
                absolutePathToProjectConfig != null
                    ? path.relative(absolutePathToProjectConfig, pluginInvocation.absolutePathToOutput)
                    : null,
        };
    }

    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName: `${pluginInvocation.name}:${pluginInvocation.version}`,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds,
    });
}
