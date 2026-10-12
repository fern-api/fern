import { generatorsYml } from "@fern-api/configuration";
import { Logger } from "@fern-api/logger";

/**
 * Logs the `unsigned-maven-publishing` warning for each selected generator that will actually publish to Maven
 * without a `signature` or `url`. Generation-time workspace validation hides warnings (it only prints a count), so
 * `fern generate` surfaces this one explicitly. Never throws: existing configurations keep working.
 *
 * Skipped when nothing is published: previews and `--dynamic-ir-only` (`publishes: false`), `--lfs-override`
 * (which rewrites the output mode to `downloadFiles` while leaving the raw schema unchanged), and `--local` runs
 * without a GitHub repository (local Docker generation writes files instead of publishing; with a GitHub
 * repository the generated workflow publishes).
 */
export function warnOnUnsignedMavenPublishing({
    groups,
    publishes,
    useLocalDocker,
    logger
}: {
    groups: generatorsYml.GeneratorGroup[];
    /** False for runs that never publish (previews, `--dynamic-ir-only`). */
    publishes: boolean;
    useLocalDocker: boolean;
    logger: Logger;
}): void {
    if (!publishes) {
        return;
    }
    for (const group of groups) {
        for (const generator of group.generators) {
            if (generator.raw == null || !generatorsYml.isUnsignedMavenPublishingWithoutUrl(generator.raw)) {
                continue;
            }
            if (!willPublishToMaven(generator.outputMode, useLocalDocker)) {
                continue;
            }
            logger.warn(generatorsYml.getUnsignedMavenPublishingWithoutUrlMessage(generator.name));
        }
    }
}

function willPublishToMaven(outputMode: generatorsYml.GeneratorInvocation["outputMode"], useLocalDocker: boolean) {
    switch (outputMode.type) {
        case "githubV2":
            return outputMode.githubV2.publishInfo?.type === "maven";
        case "publishV2":
            return !useLocalDocker && outputMode.publishV2.type === "mavenOverride";
        default:
            return false;
    }
}
