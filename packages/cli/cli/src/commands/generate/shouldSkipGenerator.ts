import type { generatorsYml } from "@fern-api/configuration-loader";

/**
 * Determines whether a generator should be skipped for remote automation.
 *
 * A generator is skipped when any of the following is true:
 * - `automation.generate` is false
 * - Output is configured for `local-file-system` (cannot run remotely)
 * - `autorelease` is disabled at the generator level, or at the root level
 *   when the generator does not specify its own override
 */
export function shouldSkipGenerator({
    generator,
    rootAutorelease
}: {
    generator: generatorsYml.GeneratorInvocation;
    rootAutorelease: boolean | undefined;
}): boolean {
    if (!generator.automation.generate) {
        return true;
    }

    // Local-file-system output cannot run remotely
    if (generator.absolutePathToLocalOutput != null) {
        return true;
    }

    // Generator-level autorelease overrides root-level
    if (generator.raw?.autorelease === false) {
        return true;
    }
    if (generator.raw?.autorelease == null && rootAutorelease === false) {
        return true;
    }

    return false;
}
