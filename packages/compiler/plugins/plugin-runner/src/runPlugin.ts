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
        pathToIr: string;
        pathToWriteConfigJson: string;
        relativeWorkspacePath: string | undefined;
    }
}

export async function runPlugin({
    pluginInvocation,
    pathToIr,
    pathToWriteConfigJson,
    relativeWorkspacePath,
}: runPlugin.Args): Promise<void> {
    const config: PluginConfig = {
        outputPathRelativeToRootOnHost: relativeWorkspacePath,
        irFilepath: DOCKER_PATH_TO_IR,
        outputDirectory: DOCKER_CODEGEN_OUTPUT_DIRECTORY,
        helpers: {
            encodings: {},
        },
        customConfig: pluginInvocation.config,
    };
    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    const binds = [`${pathToWriteConfigJson}:${DOCKER_PLUGIN_CONFIG_PATH}:ro`, `${pathToIr}:${DOCKER_PATH_TO_IR}:ro`];
    if (pluginInvocation.absolutePathToOutput != null) {
        await rm(pluginInvocation.absolutePathToOutput, { force: true, recursive: true });
        binds.push(`${pluginInvocation.absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    await runDocker({
        imageName: `${pluginInvocation.name}:${pluginInvocation.version}`,
        args: [DOCKER_PLUGIN_CONFIG_PATH],
        binds,
    });
}
