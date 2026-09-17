import { ContainerRunner } from "@fern-api/core-utils";
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
    const { stdout, stderr, exitCode } = await loggingExeca(
        logger,
        runner,
        ["inspect", "--format", "{{json .Config.Labels}}", imageName],
        {
            reject: false,
            doNotPipeOutput: true
        }
    );

    if (exitCode !== 0) {
        logger?.debug(
            `Could not inspect ${imageName} for the ${MULTI_SPEC_LABEL} label (exit code ${exitCode}); ` +
                `treating it as single-spec.\n${stderr || stdout}`
        );
        return false;
    }

    let labels: unknown;
    try {
        labels = JSON.parse(stdout.trim());
    } catch (error) {
        logger?.debug(
            `Could not read labels from ${imageName}; treating it as single-spec: ` +
                (error instanceof Error ? error.message : String(error))
        );
        return false;
    }

    // `null` when the image carries no labels at all, which is what the format string prints for an
    // absent map.
    if (labels == null || typeof labels !== "object" || !(MULTI_SPEC_LABEL in labels)) {
        return false;
    }
    return labels[MULTI_SPEC_LABEL] === "true";
}
