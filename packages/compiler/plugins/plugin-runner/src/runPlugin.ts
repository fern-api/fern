import { runDocker } from "@fern-api/docker-utils";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { Plugin } from "./types";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const CONFIG_JSON_FILENAME = "config.json";
const DOCKER_PLUGIN_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, CONFIG_JSON_FILENAME);
const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, "ir.json");
export declare namespace runPlugin {
    export interface Args {
        plugin: Plugin;
        pathToIr: string;
        pluginTempDir: string;
        /**
         * this directory will be mapped to DOCKER_CODEGEN_OUTPUT_DIRECTORY.
         * the plugin will be instructed to write any files to this directory.
         */
        pluginOutputDirectory: string;
    }
}

export async function runPlugin({
    plugin,
    pathToIr,
    pluginTempDir,
    pluginOutputDirectory,
}: runPlugin.Args): Promise<void> {
    const pluginConfig = {
        irFilepath: DOCKER_PATH_TO_IR,
        outputDirectory: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
        packagePrefix: "com",
    };
    const configJsonPath = path.join(pluginTempDir, "config.json");
    await writeFile(configJsonPath, JSON.stringify(pluginConfig, undefined, 4));

    await rm(pluginOutputDirectory, { force: true, recursive: true });

    await runDocker({
        imageName: `${plugin.name}:${plugin.version}`,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds: [
            `${configJsonPath}:${DOCKER_PLUGIN_CONFIG_PATH}`,
            `${pathToIr}:${DOCKER_PATH_TO_IR}`,
            `${pluginOutputDirectory}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`,
        ],
    });
}
