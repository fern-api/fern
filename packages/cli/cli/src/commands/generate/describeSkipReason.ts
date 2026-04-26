import type { generatorsYml } from "@fern-api/configuration-loader";
import type { GeneratorSkipReason } from "@fern-api/remote-workspace-runner";

/**
 * Returns a machine-readable skip reason for a generator excluded from automation, or null when
 * the generator is eligible. Mirrors {@link describeSkipReason} but typed for programmatic use.
 *
 * The two functions live side-by-side on purpose: the machine-readable tag drives the step
 * summary's "⏭️ Skipped - local output" cell, while the prose version is used in error messages
 * where index-targeting rejects a skipped generator.
 */
export function classifySkipReason(
    generator: generatorsYml.GeneratorInvocation,
    rootAutorelease: boolean | undefined
): GeneratorSkipReason | null {
    if (!generator.automation.generate) {
        return "opted_out";
    }
    if (generator.absolutePathToLocalOutput != null) {
        return "local_output";
    }
    if (generator.raw?.autorelease === false) {
        return "opted_out";
    }
    if (generator.raw?.autorelease == null && rootAutorelease === false) {
        return "opted_out";
    }
    return null;
}

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
