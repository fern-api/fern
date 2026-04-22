export type ResolveGroupAliasResult =
    | {
          type: "resolved";
          /** One or more concrete group names. A single-element array when the input was a plain group name. */
          groupNames: string[];
      }
    | {
          type: "alias-references-missing-group";
          /** The alias name the caller supplied. */
          alias: string;
          /** The name inside the alias that does not exist in the project. */
          missingGroupName: string;
          /** All concrete group names that exist, for the error message. */
          availableGroupNames: string[];
      }
    | {
          type: "unknown";
          /** The name the caller supplied that matched neither a group nor an alias. */
          name: string;
          availableGroupNames: string[];
          availableAliasNames: string[];
      };

/**
 * Resolves a group name or alias to a list of concrete group names, without side effects.
 *
 * The caller is responsible for converting non-`"resolved"` results into user-facing errors
 * (via `context.failAndThrow`, etc.). This separation keeps alias validation pure and testable.
 *
 * Rules:
 *   - If `name` is a key in `groupAliases`, it expands to the alias's target list — but every
 *     target must be a valid concrete group name, else `"alias-references-missing-group"`.
 *   - Otherwise if `name` is a concrete group name, it resolves to `[name]`.
 *   - Otherwise `"unknown"`.
 */
export function resolveGroupAlias({
    name,
    groupAliases,
    availableGroupNames
}: {
    name: string;
    groupAliases: Record<string, string[]>;
    availableGroupNames: string[];
}): ResolveGroupAliasResult {
    const aliasTargets = groupAliases[name];
    if (aliasTargets != null) {
        for (const target of aliasTargets) {
            if (!availableGroupNames.includes(target)) {
                return {
                    type: "alias-references-missing-group",
                    alias: name,
                    missingGroupName: target,
                    availableGroupNames
                };
            }
        }
        return { type: "resolved", groupNames: aliasTargets };
    }

    if (availableGroupNames.includes(name)) {
        return { type: "resolved", groupNames: [name] };
    }

    return {
        type: "unknown",
        name,
        availableGroupNames,
        availableAliasNames: Object.keys(groupAliases)
    };
}
