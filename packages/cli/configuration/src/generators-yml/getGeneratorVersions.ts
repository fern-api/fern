import { TaskContext } from "@fern-api/task-context";
import Dockerode from "dockerode";

export async function getLatestGeneratorVersion(
    generatorName: string,
    context?: TaskContext
): Promise<string | undefined> {
    const docker = new Dockerode();
    let image;
    try {
        context?.logger.debug(`Determining latest version for generator ${generatorName}.`);
        const pullStream = await docker.pull(`${generatorName}`);
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(pullStream, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        image = await docker.getImage(`${generatorName}:latest`).inspect();
    } catch (e) {
        context?.logger.error(`No image found behind generator ${generatorName} at tag latest.`);
        return;
    }

    // This assumes we have a label of the form version=x.y.z
    // specifically adding a label to do this to be able to more easily get the version without regex
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const generatorVersion = image.Config.Labels?.["version"];
    if (generatorVersion == null) {
        context?.logger.error(`No version found behind generator ${generatorName} at tag latest.`);
        return;
    }
    context?.logger.debug(`Found image behind generator ${generatorName} at tag latest: ${generatorVersion}.`);
    return generatorVersion;
}
