import Docker from "dockerode";
import { Writable } from "stream";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = "/output";
const DOCKER_PLUGIN_CONFIG_PATH = `${DOCKER_FERN_DIRECTORY}/config.json`;

export async function invokePlugin(
    pluginImage: string,
    pluginVersion: string,
    configDirectoryAbsolutePath: string,
    outputDirectoryAbsolutePath: string
): Promise<void> {
    const docker = new Docker();
    const pluginDockerTag = pluginImage + ":" + pluginVersion;
    await docker
        .run(
            pluginDockerTag,
            [DOCKER_PLUGIN_CONFIG_PATH],
            new Writable({
                write(_chunk, _encding, callback) {
                    setImmediate(callback);
                },
            }),
            {
                Binds: [
                    `${configDirectoryAbsolutePath}:${DOCKER_FERN_DIRECTORY}`,
                    `${outputDirectoryAbsolutePath}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`,
                ],
            }
        )
        .then(function (data) {
            const container = data[1];
            return container.remove();
        });
}
