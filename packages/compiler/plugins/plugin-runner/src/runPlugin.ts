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
        imageName: string;
        pathToIr: string;
        customPluginConfig: unknown;
        pathToWriteConfigJson: string;
        /**
         * this directory will be mapped to DOCKER_CODEGEN_OUTPUT_DIRECTORY.
         * the plugin will be instructed to write any files to this directory.
         */
        pluginOutputDirectory: string | undefined;
    }
}

export async function runPlugin({
    imageName,
    pathToIr,
    customPluginConfig,
    pathToWriteConfigJson,
    pluginOutputDirectory,
}: runPlugin.Args): Promise<void> {
    const config: PluginConfig = {
        irFilepath: DOCKER_PATH_TO_IR,
        outputDirectory: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
        helpers: {
            encodings: {},
        },
        customConfig: customPluginConfig,
    };
    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    const binds = [`${pathToWriteConfigJson}:${DOCKER_PLUGIN_CONFIG_PATH}:ro`, `${pathToIr}:${DOCKER_PATH_TO_IR}:ro`];
    if (pluginOutputDirectory != null) {
        await rm(pluginOutputDirectory, { force: true, recursive: true });
        binds.push(`${pluginOutputDirectory}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    await runDocker({
        imageName,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds,
    });
}
