import { generatorsYml } from "@fern-api/configuration";
import { DockerTestRunner } from "../commands/test/test-runner";
import { getGeneratorInvocation } from "../utils/getGeneratorInvocation";
import { AbsoluteFilePath } from "../../../commons/fs-utils/src/AbsoluteFilePath";
import { OutputMode } from "../config/api";
import { parseDockerOrThrow } from "../utils/parseDockerOrThrow";
import { ALL_AUDIENCES } from "../utils/constants";
import { Readme } from "@fern-fern/generator-exec-sdk/api/resources/readme/client/Client";
import { DOCKER_GENERATOR_CONFIG_PATH } from "../../../cli/generation/local-generation/local-workspace-runner/src/constants";
import { runDocker } from "../../../cli/generation/local-generation/local-workspace-runner/node_modules/@fern-api/docker-utils/src";
export const handler = async (event: Record<string, unknown>): Promise<{ statusCode: number; body: string }> => {
    // eslint-disable-next-line no-console
    // const dockerTestRunner = new DockerTestRunner(

    // );
    const binds = [
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-m1jWBIB8Mzl1:/fern/config.json:ro",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-Dz5GdVR2uMJG:/fern/ir.json:ro",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-C4cjTGlze09X:/fern/output",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-spy6Nu0En5eF:/fern/snippet.json",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-L0m8sZa8Duww:/fern/snippet-templates.json"
    ];
    await runDocker({
        imageName: "fernapi/fern-typescript-node-sdk",
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: true
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: event
        })
    };
};
