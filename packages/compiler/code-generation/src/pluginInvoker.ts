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
    try {
        await runPluginDocker(docker, pluginDockerTag, configDirectoryAbsolutePath, outputDirectoryAbsolutePath);
    } catch (e) {
        console.log(e);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any)?.statusCode === 404) {
            await pullPluginImage(docker, pluginDockerTag);
            await runPluginDocker(docker, pluginDockerTag, configDirectoryAbsolutePath, outputDirectoryAbsolutePath);
        }
    }
}

async function pullPluginImage(docker: Docker, pluginDockerTag: string): Promise<void> {
    const pullStream = await docker.pull(pluginDockerTag);
    await new Promise<void>((resolve, reject) => {
        docker.modem.followProgress(pullStream, (error) => {
            if (error != null) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function runPluginDocker(
    docker: Docker,
    pluginDockerTag: string,
    configDirectoryAbsolutePath: string,
    outputDirectoryAbsolutePath: string
): Promise<void> {
    const runResponse = await docker.run(
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
    );
    const container = runResponse[1];
    return container.remove();
}
