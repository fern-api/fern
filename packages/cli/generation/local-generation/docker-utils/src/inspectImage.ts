import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

export declare namespace getImageLabels {
    export interface Args {
        logger?: Logger;
        imageName: string;
        runner?: ContainerRunner;
        /**
         * Pull the image when it is not present locally. Local generation is about to pull and run
         * this exact image, so the pull is moved earlier rather than added.
         */
        pullIfAbsent?: boolean;
        signal?: AbortSignal;
    }
}

/**
 * Reads the OCI labels declared on an image.
 *
 * Returns an empty record rather than throwing when the image cannot be inspected. A generator that
 * declares no labels, an image that is not present and cannot be pulled, or a container runtime that
 * is unavailable must all fall back to existing behaviour instead of failing a generation that would
 * otherwise succeed.
 */
export async function getImageLabels({
    logger,
    imageName,
    runner,
    pullIfAbsent = true,
    signal
}: getImageLabels.Args): Promise<Record<string, string>> {
    const containerRunner = runner ?? "docker";

    const inspect = async (): Promise<string | undefined> => {
        const { stdout, exitCode } = await loggingExeca(
            undefined,
            containerRunner,
            ["image", "inspect", imageName, "--format", "{{json .Config.Labels}}"],
            { reject: false, doNotPipeOutput: true, signal }
        );
        return exitCode === 0 ? stdout : undefined;
    };

    let raw = await inspect();

    if (raw == null && pullIfAbsent) {
        const { exitCode } = await loggingExeca(undefined, containerRunner, ["pull", imageName], {
            reject: false,
            doNotPipeOutput: true,
            signal
        });
        if (exitCode === 0) {
            raw = await inspect();
        }
    }

    if (raw == null) {
        logger?.debug(`Could not inspect labels on ${imageName}; continuing without them.`);
        return {};
    }

    try {
        const parsed: unknown = JSON.parse(raw.trim());
        if (typeof parsed !== "object" || parsed === null) {
            return {};
        }
        return Object.fromEntries(
            Object.entries(parsed as Record<string, unknown>).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string"
            )
        );
    } catch {
        logger?.debug(`Labels on ${imageName} were not valid JSON; continuing without them.`);
        return {};
    }
}
