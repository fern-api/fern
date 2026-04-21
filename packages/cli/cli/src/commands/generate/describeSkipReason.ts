import type { generatorsYml } from "@fern-api/configuration-loader";

/**
 * Returns a human-readable reason explaining why the generator is excluded from automation,
 * or null when the generator is eligible. Mirrors {@link shouldSkipGenerator}'s logic but
 * with messages suitable for user-facing errors.
 *
 * Callers that only need a boolean should use {@link shouldSkipGenerator} instead.
 */
export function describeSkipReason(
    generator: generatorsYml.GeneratorInvocation,
    rootAutorelease: boolean | undefined
): string | null {
    if (!generator.automation.generate) {
        return "automations.generate is false";
    }
    if (generator.absolutePathToLocalOutput != null) {
        return "output is configured for local-file-system (cannot run remotely)";
    }
    if (generator.raw?.autorelease === false) {
        return "autorelease is false";
    }
    if (generator.raw?.autorelease == null && rootAutorelease === false) {
        return "autorelease is false at the root of generators.yml";
    }
    return null;
}
