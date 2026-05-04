import type { generatorsYml } from "@fern-api/configuration-loader";

import { describeSkipReason } from "./describeSkipReason.js";

/**
 * Determines whether a generator should be skipped for remote automation.
 *
 * A generator is skipped when any of the following is true:
 * - `automation.generate` is false
 * - Output is configured for `local-file-system` (cannot run remotely)
 * - `autorelease` is disabled at the generator level, or at the root level
 *   when the generator does not specify its own override
 *
 * Callers that need the reason for an error message should use {@link describeSkipReason}.
 */
export function shouldSkipGenerator({
    generator,
    rootAutorelease
}: {
    generator: generatorsYml.GeneratorInvocation;
    rootAutorelease: boolean | undefined;
}): boolean {
    return describeSkipReason(generator, rootAutorelease) != null;
}
