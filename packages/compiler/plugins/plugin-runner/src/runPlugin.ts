import { runDocker } from "@fern-api/docker-utils";
import path from "path";
import { Plugin } from "./types";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const DOCKER_PLUGIN_CONFIG_PATH = `${DOCKER_FERN_DIRECTORY}/config.json`;

export declare namespace runPlugin {
    export interface Args {
        plugin: Plugin;
        pathToIr: string;
        /**
         * this directory will be mapped to DOCKER_CODEGEN_OUTPUT_DIRECTORY.
         * the plugin will be instructed to write any files to this directory.
         */
        pluginOutputDirectory: string;
    }
}

export async function runPlugin({ plugin, pathToIr, pluginOutputDirectory }: runPlugin.Args): Promise<void> {
    await runDocker({
        imageName: `${plugin.name}:${plugin.version}`,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds: [
            `${pathToIr}:${path.join(DOCKER_FERN_DIRECTORY, "ir.json")}`,
            `${pluginOutputDirectory}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`,
        ],
    });
}
