import type { generatorsYml } from "@fern-api/configuration-loader";

export type ResolveGroupNamesResult =
    | {
          type: "fan-out";
          /** Every group defined in generators.yml, for automation fan-out. */
          groupNames: string[];
      }
    | {
          type: "targeted";
          /** The group name to resolve (may be an alias). Could be the explicit --group or the default. */
          groupName: string;
          /** True when this was picked up from default-group rather than --group. Drives the info log. */
          fromDefaultGroup: boolean;
      }
    | {
          type: "missing-group";
          /** All available group names, for building an error message. */
          availableGroupNames: string[];
      };

/**
 * Decides which groups to run without causing side effects (logging, throws, alias resolution).
 *
 * - In automation fan-out (explicit `isAutomation` and no `--group`): returns every group,
 *   ignoring `default-group`. The point of fan-out is to hit them all.
 * - Otherwise: use `--group` if present, else `default-group`, else signal missing-group
 *   so the caller can build a helpful error message.
 *
 * Alias resolution is deferred to the caller because it needs a `TaskContext` to throw on
 * malformed aliases — keeping this pure makes it easy to unit test.
 */
export function resolveGroupNamesForGeneration({
    groupName,
    generatorsConfiguration,
    isAutomation
}: {
    groupName: string | undefined;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration;
    isAutomation: boolean;
}): ResolveGroupNamesResult {
    if (isAutomation && groupName == null) {
        return {
            type: "fan-out",
            groupNames: generatorsConfiguration.groups.map((g) => g.groupName)
        };
    }

    const effective = groupName ?? generatorsConfiguration.defaultGroup;
    if (effective == null) {
        return {
            type: "missing-group",
            availableGroupNames: generatorsConfiguration.groups.map((g) => g.groupName)
        };
    }
    return {
        type: "targeted",
        groupName: effective,
        fromDefaultGroup: groupName == null
    };
}
