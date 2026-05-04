import type { generatorsYml } from "@fern-api/configuration-loader";

/**
 * Expands the caller's `--group` filters into a set of concrete group names.
 *
 * Returns null when no filter was supplied (meaning "match every group"). Otherwise expands each
 * requested name through the alias table (when one is configured) and unions the results,
 * preserving order and de-duplicating. Used only to pre-filter groups for the
 * `checkOutputDirectory` pre-flight and posthog telemetry — the authoritative group resolution
 * for generation lives in `resolveGroupNamesForGeneration` + `resolveGroupAlias`.
 *
 * `groupNames` of `undefined` or `[]` both mean "no filter"; aliases that resolve to an empty
 * target list contribute nothing; the same group name appearing twice (directly or via alias
 * overlap) contributes once.
 */
export function expandGroupFilter(
    groupNames: string[] | undefined,
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined
): string[] | null {
    if (groupNames == null || groupNames.length === 0) {
        return null;
    }

    const expanded: string[] = [];
    for (const name of groupNames) {
        const aliasGroups = generatorsConfiguration?.groupAliases[name];
        for (const resolved of aliasGroups ?? [name]) {
            if (!expanded.includes(resolved)) {
                expanded.push(resolved);
            }
        }
    }
    return expanded;
}
