import { ContainerRunner } from "@fern-api/core-utils";
import { ensureDockerHubOatLogin, pullImage } from "@fern-api/docker-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

/**
 * OCI label the Postman adapter sets on images that generate from every spec they are handed.
 *
 * The label rather than the image's version, because the adapter is published under the same
 * generator names in whichever registry a self-hosted deployment pulls from -- a version comparison
 * cannot tell a vendor's build apart from Fern's, and a digest pin carries no version at all. The
 * image states its own capability instead, which is the only thing that holds for a reference the
 * CLI did not construct.
 */
export const MULTI_SPEC_LABEL = "com.postman.sdk-gen.adapter.multi-spec";

/**
 * Whether the image declares that it generates from every spec in the SDK Config IR.
 *
 * Fails closed. An image published before the label existed, one that sets it to anything other
 * than `"true"`, and an `inspect` that cannot be run or cannot be parsed are all answered `false`,
 * because the consequence of guessing wrong the other way is an SDK covering only the first spec
 * that exits zero -- the silent wrong answer this check exists to prevent. A refusal is recoverable;
 * a wrong SDK the customer ships is not.
 */
export async function imageSupportsMultiSpec({
    imageName,
    runner,
    logger
}: {
    imageName: string;
    runner: ContainerRunner;
    logger: Logger | undefined;
}): Promise<boolean> {
    const inspect = () =>
        loggingExeca(logger, runner, ["inspect", "--type", "image", "--format", "{{json .Config.Labels}}", imageName], {
            reject: false,
            doNotPipeOutput: true
        });

    try {
        let result = await inspect();
        if (result.exitCode !== 0) {
            // Execution normally pulls missing images, but this gate runs before execution.
            await ensureDockerHubOatLogin({ imageName, runner, logger });
            await pullImage(imageName, runner);
            result = await inspect();
        }
        if (result.exitCode !== 0) {
            return false;
        }
        const labels: unknown = JSON.parse(result.stdout.trim());
        return (
            labels != null &&
            typeof labels === "object" &&
            MULTI_SPEC_LABEL in labels &&
            labels[MULTI_SPEC_LABEL] === "true"
        );
    } catch (error) {
        logger?.debug(
            `Could not read labels from ${imageName}; treating it as single-spec: ` +
                (error instanceof Error ? error.message : String(error))
        );
        return false;
    }
}
