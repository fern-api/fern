import type { generatorsYml } from "@fern-api/configuration-loader";
import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";

import { shouldSkipGenerator } from "./shouldSkipGenerator.js";

/**
 * Whether a generator should be included in the `checkOutputDirectory` pre-flight.
 *
 * In automation fan-out, generators that are opted out (via `automations.generate: false`,
 * `autorelease: false`, or local-file-system output) won't actually run, so prompting about
 * their output directories is noise. Outside automation mode we always pre-flight every
 * generator to preserve existing behavior.
 */
export function shouldPreflightGenerator({
    generator,
    rootAutorelease,
    automation
}: {
    generator: generatorsYml.GeneratorInvocation;
    rootAutorelease: boolean | undefined;
    automation: AutomationRunOptions | undefined;
}): boolean {
    if (automation == null) {
        return true;
    }
    return !shouldSkipGenerator({ generator, rootAutorelease });
}
