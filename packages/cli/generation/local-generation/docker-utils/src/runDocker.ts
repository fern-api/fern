import Docker from "dockerode";
import { writeFile } from "fs/promises";
import { Writable } from "stream";
import tmp from "tmp-promise";

export declare namespace runDocker {
    export interface Args {
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
    imageName,
    args,
    binds,
    writeLogsToFile = true,
    removeAfterCompletion = false
}: runDocker.Args): Promise<void> {
    const docker = new Docker();
    const tryRun = () => tryRunDocker({ docker, imageName, args, binds, removeAfterCompletion, writeLogsToFile });
    try {
        const logs = await tryRun();
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
    docker,
    imageName,
    args,
    binds,
    removeAfterCompletion,
    writeLogsToFile
}: {
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
            Binds: binds,
            User: "root"
        }
    );

    if (removeAfterCompletion) {
        await container.remove();
    }

    if (status.Error != null) {
        throw status.Error;
    }

    if (status.StatusCode !== 0) {
        if (writeLogsToFile) {
            const tmpFile = await tmp.file();
            await writeFile(tmpFile.path, logs);
            throw new Error(`Docker exited with a non-zero exit code. Logs here: ${tmpFile.path}`);
        } else {
            throw new Error("Docker exited with a non-zero exit code.");
        }
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
