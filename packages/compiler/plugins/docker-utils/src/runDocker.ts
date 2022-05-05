import Docker from "dockerode";
import { Writable } from "stream";

export declare namespace runDocker {
    export interface Args {
        imageName: string;
        args?: string[];
        binds?: string[];
    }
}

export async function runDocker({ imageName, args, binds }: runDocker.Args): Promise<void> {
    const docker = new Docker();
    const tryRun = () => tryRunDocker({ docker, imageName, args, binds });
    try {
        await tryRun();
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any)?.statusCode === 404) {
            await pullImage(docker, imageName);
            await tryRun();
        }
    }
}

// may throw a 404 if the image hasn't been downloaded
async function tryRunDocker({
    docker,
    imageName,
    args,
    binds,
}: {
    docker: Docker;
    imageName: string;
    args?: string[];
    binds?: string[];
}): Promise<void> {
    const runResponse = await docker.run(
        imageName,
        args != null ? args : [],
        new Writable({
            write(_chunk, _encding, callback) {
                setImmediate(callback);
            },
        }),
        {
            Binds: binds,
        }
    );
    const container = runResponse[1];
    return container.remove();
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
