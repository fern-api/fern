import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml
} from "@fern-api/configuration-loader";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { GROUP_CLI_OPTION } from "../../constants.js";
import { resolveGroupAlias } from "./resolveGroupAlias.js";
import { resolveGroupNamesForGeneration } from "./resolveGroupNamesForGeneration.js";

/**
 * Resolves the list of group names to run against, throwing a helpful `failAndThrow` for any
 * misconfiguration (missing group, unknown alias, alias pointing at a non-existent group).
 *
 * Composes two pure helpers:
 *   - `resolveGroupNamesForGeneration` — decides between fan-out / targeted / missing-group.
 *   - `resolveGroupAlias` — expands an alias to its targets, validating each.
 *
 * The helpers themselves are pure and live in their own modules; this wrapper owns the
 * error-message rendering and the throw.
 *
 * When the user passes multiple `--group` values (e.g. `fern generate --group ts --group java`),
 * each value is resolved independently and the results are unioned, preserving first-occurrence
 * order and de-duplicating. An invalid group name fails fast via `failAndThrow` — subsequent
 * names are not attempted.
 */
export function resolveGroupsOrFail({
    groupNames,
    generatorsConfiguration,
    isAutomation,
    context
}: {
    groupNames: string[] | undefined;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration;
    isAutomation: boolean;
    context: TaskContext;
}): string[] {
    // No `--group`: delegate the fan-out vs. default-group vs. missing-group decision to the
    // single-group resolver with `groupName: undefined`. Passing one explicit `--group` takes
    // the same path with that name. Multiple `--group` values resolve each independently and
    // union the results (de-duplicated, order-preserving).
    if (groupNames == null || groupNames.length === 0) {
        return resolveSingleGroupOrFail({
            groupName: undefined,
            generatorsConfiguration,
            isAutomation,
            context
        });
    }
    const resolved: string[] = [];
    for (const groupName of groupNames) {
        for (const name of resolveSingleGroupOrFail({
            groupName,
            generatorsConfiguration,
            isAutomation,
            context
        })) {
            if (!resolved.includes(name)) {
                resolved.push(name);
            }
        }
    }
    return resolved;
}

function resolveSingleGroupOrFail({
    groupName,
    generatorsConfiguration,
    isAutomation,
    context
}: {
    groupName: string | undefined;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration;
    isAutomation: boolean;
    context: TaskContext;
}): string[] {
    const resolution = resolveGroupNamesForGeneration({ groupName, generatorsConfiguration, isAutomation });
    if (resolution.type === "fan-out") {
        return resolution.groupNames;
    }
    if (resolution.type === "missing-group") {
        const longestGroupName = Math.max(...resolution.availableGroupNames.map((name) => name.length));
        const currentArgs = process.argv.slice(2).join(" ");
        const suggestions = resolution.availableGroupNames
            .map((name) => {
                const suggestedCommand = `fern ${currentArgs} --${GROUP_CLI_OPTION} ${name}`;
                return ` › ${chalk.bold(name.padEnd(longestGroupName))}  ${chalk.dim(suggestedCommand)}`;
            })
            .join("\n");
        context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}:\n${suggestions}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return []; // unreachable — failAndThrow throws
    }

    // resolution.type === "targeted"
    if (resolution.fromDefaultGroup) {
        context.logger.info(
            chalk.dim(`Using default group '${resolution.groupName}' from ${GENERATORS_CONFIGURATION_FILENAME}`)
        );
    }
    const aliasResult = resolveGroupAlias({
        name: resolution.groupName,
        groupAliases: generatorsConfiguration.groupAliases,
        availableGroupNames: generatorsConfiguration.groups.map((g) => g.groupName)
    });
    if (aliasResult.type === "alias-references-missing-group") {
        context.failAndThrow(
            `Group alias '${aliasResult.alias}' references non-existent group '${aliasResult.missingGroupName}'. ` +
                `Available groups: ${aliasResult.availableGroupNames.join(", ")}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return [];
    }
    if (aliasResult.type === "unknown") {
        const aliasesSuffix =
            aliasResult.availableAliasNames.length > 0
                ? `. Available aliases: ${aliasResult.availableAliasNames.join(", ")}`
                : "";
        context.failAndThrow(
            `'${aliasResult.name}' is not a valid group or alias. ` +
                `Available groups: ${aliasResult.availableGroupNames.join(", ")}${aliasesSuffix}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return [];
    }
    return aliasResult.groupNames;
}
