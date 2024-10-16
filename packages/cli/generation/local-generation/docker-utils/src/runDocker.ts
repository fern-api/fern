import { Logger } from "@fern-api/logger";
import Docker from "dockerode";
import { writeFile } from "fs/promises";
import { Writable } from "stream";
import tmp from "tmp-promise";

export declare namespace runDocker {
    export interface Args {
        logger: Logger;
        imageName: string;
        args?: string[];
        binds?: string[];
        writeLogsToFile?: boolean;
        removeAfterCompletion?: boolean;
    }

    export interface Result {
        logs: string;
    }
}

export async function runDocker({
    logger,
    imageName,
    args,
    binds,
    writeLogsToFile = true,
    removeAfterCompletion = false
}: runDocker.Args): Promise<void> {
    const docker = new Docker();
    const tryRun = () =>
        tryRunDocker({ logger, docker, imageName, args, binds, removeAfterCompletion, writeLogsToFile });
    try {
        await tryRun();
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any)?.statusCode === 404) {
            await pullImage(docker, imageName);
            await tryRun();
        } else {
            throw e;
        }
    }
}

// may throw a 404 if the image hasn't been downloaded
async function tryRunDocker({
    logger,
    docker,
    imageName,
    args,
    binds,
    removeAfterCompletion,
    writeLogsToFile
}: {
    logger: Logger;
    docker: Docker;
    imageName: string;
    args?: string[];
    binds?: string[];
    removeAfterCompletion: boolean;
    writeLogsToFile: boolean;
}): Promise<void> {
    let logs = "";
    const [status, container] = await docker.run(
        imageName,
        args != null ? args : [],
        new Writable({
            write(_chunk, _encding, callback) {
                logs += _chunk.toString();
                setImmediate(callback);
            }
        }),
        {
            HostConfig: {
                Binds: binds
            },
            User: "root",
            NetworkMode: "redis",
            NetworkingConfig: {
                EndpointsConfig: {
                    redis: {}
                }
            }
        }
    );

    if (removeAfterCompletion) {
        await container.remove();
    }

    if (status.Error != null) {
        throw status.Error;
    }

    if (writeLogsToFile) {
        const tmpFile = await tmp.file();
        await writeFile(tmpFile.path, logs);
        logger.info(`Generator logs here: ${tmpFile.path}`);
    }

    if (status.StatusCode !== 0) {
        throw new Error("Docker exited with a non-zero exit code.");
    }
}

async function pullImage(docker: Docker, imageName: string): Promise<void> {
    const pullStream = await docker.pull(imageName);
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
