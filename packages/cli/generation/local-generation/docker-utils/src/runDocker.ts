import Docker from "dockerode";
import { Writable } from "stream";

export declare namespace runDocker {
    export interface Args {
        imageName: string;
        args?: string[];
        binds?: string[];
        removeAfterCompletion?: boolean;
    }
}

export async function runDocker({
    imageName,
    args,
    binds,
    removeAfterCompletion = false
}: runDocker.Args): Promise<void> {
    const docker = new Docker();
    const tryRun = () => tryRunDocker({ docker, imageName, args, binds, removeAfterCompletion });
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
    docker,
    imageName,
    args,
    binds,
    removeAfterCompletion
}: {
    docker: Docker;
    imageName: string;
    args?: string[];
    binds?: string[];
    removeAfterCompletion: boolean;
}): Promise<void> {
    const [status, container] = await docker.run(
        imageName,
        args != null ? args : [],
        new Writable({
            write(_chunk, _encding, callback) {
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
