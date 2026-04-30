import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";

/**
 * Whether a group whose `filterGenerators` call returned "not found" should be silently skipped
 * rather than fatally erroring.
 *
 * In automation fan-out across multiple groups, name-based targeting (`--generator <name>`)
 * is expected to silently filter out groups that don't contain the named generator — matching
 * the pre-flight behavior in `confirmOutputDirectoriesForEligibleGenerators`. Index-based
 * targeting (`--generator 0`) still fails loudly: if the user picks a specific slot, the slot
 * has to exist. Outside automation mode, every mismatch is a fatal misconfiguration.
 */
export function shouldSkipMissingGenerator({
    automation,
    generatorName,
    generatorIndex
}: {
    automation: AutomationRunOptions | undefined;
    generatorName: string | undefined;
    generatorIndex: number | undefined;
}): boolean {
    return automation != null && generatorName != null && generatorIndex == null;
}
