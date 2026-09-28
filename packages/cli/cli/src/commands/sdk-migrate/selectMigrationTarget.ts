import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import type { Project } from "@fern-api/project-loader";
import { getFernSdkGenApiLanguage } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";

import type { CliContext } from "../../cli-context/CliContext.js";
import { resolveGroupAlias } from "../generate/resolveGroupAlias.js";
import type { SdkMigrateArgs } from "./sdkMigrate.js";

export interface MigrationTarget {
    groups: generatorsYml.GeneratorGroup[];
    workspace: AbstractAPIWorkspace<unknown>;
}

export async function selectMigrationTarget({
    project,
    cliContext,
    args
}: {
    project: Project;
    cliContext: CliContext;
    args: Pick<SdkMigrateArgs, "api" | "group">;
}): Promise<MigrationTarget> {
    const workspace = await selectWorkspace(project, cliContext, args.api);
    const configuration = workspace.generatorsConfiguration;
    if (configuration == null || configuration.groups.length === 0) {
        throw new CliError({
            message: "No SDK generator groups configured in generators.yml",
            code: CliError.Code.ConfigError
        });
    }
    const groups = await selectGroups(configuration, cliContext, args.group);
    assertUniqueTargetLanguages(groups);
    return { workspace, groups };
}

async function selectWorkspace(
    project: Project,
    cliContext: CliContext,
    requestedApi: string | undefined
): Promise<AbstractAPIWorkspace<unknown>> {
    const workspaces = project.apiWorkspaces;
    if (workspaces.length === 0) {
        throw new CliError({
            message: "No APIs found",
            code: CliError.Code.ConfigError
        });
    }
    if (requestedApi != null) {
        const workspace = workspaces.find(
            (candidate) =>
                candidate.workspaceName === requestedApi ||
                (candidate.workspaceName == null && requestedApi === "default")
        );
        if (workspace != null) {
            return workspace;
        }
        throw new CliError({
            message: `API '${requestedApi}' not found. Available APIs: ${workspaceNames(workspaces).join(", ")}`,
            code: CliError.Code.ConfigError
        });
    }
    const onlyWorkspace = workspaces[0];
    if (workspaces.length === 1 && onlyWorkspace != null) {
        return onlyWorkspace;
    }
    const choices = workspaces
        .map((workspace) => ({
            name: workspace.workspaceName ?? "default",
            value: workspace
        }))
        .sort((left, right) => left.name.localeCompare(right.name));
    const names = choices.map((choice) => choice.name);
    return promptSelect({
        cliContext,
        message: "Multiple APIs found. Select one:",
        choices,
        nonInteractiveError: `Multiple APIs found: ${names.join(", ")}. Use --api to select one.`,
        flagHint: (workspace) => `--api ${workspace.workspaceName ?? "default"}`
    });
}

async function selectGroups(
    configuration: generatorsYml.GeneratorsConfiguration,
    cliContext: CliContext,
    requestedGroups: string[] | undefined
): Promise<generatorsYml.GeneratorGroup[]> {
    const groupNames =
        requestedGroups ??
        (cliContext.isTTY || configuration.defaultGroup == null ? undefined : [configuration.defaultGroup]);
    if (groupNames == null) {
        const onlyGroup = configuration.groups[0];
        if (configuration.groups.length === 1 && onlyGroup != null) {
            return [onlyGroup];
        }
        const names = configuration.groups.map((group) => group.groupName);
        const defaultGroupNames = new Set(
            configuration.defaultGroup == null
                ? []
                : resolveRequestedGroupNames(configuration, [configuration.defaultGroup])
        );
        return promptGroupSelection({
            cliContext,
            choices: configuration.groups.map((group) => ({
                checked: defaultGroupNames.has(group.groupName),
                name: group.groupName,
                value: group
            })),
            nonInteractiveError: `Multiple SDK groups found: ${names.join(", ")}. Repeat --group for groups that resolve to the same API and use distinct target languages.`
        });
    }

    const uniqueNames = [...new Set(resolveRequestedGroupNames(configuration, groupNames))];
    return uniqueNames.map((resolvedName) => {
        const group = configuration.groups.find((candidate) => candidate.groupName === resolvedName);
        if (group == null) {
            throw new CliError({
                message: `SDK group '${resolvedName}' not found`,
                code: CliError.Code.ConfigError
            });
        }
        return group;
    });
}

function resolveRequestedGroupNames(
    configuration: generatorsYml.GeneratorsConfiguration,
    groupNames: string[]
): string[] {
    const availableGroupNames = configuration.groups.map((group) => group.groupName);
    return groupNames.flatMap((groupName) => {
        const resolution = resolveGroupAlias({
            name: groupName,
            groupAliases: configuration.groupAliases,
            availableGroupNames
        });
        if (resolution.type === "alias-references-missing-group") {
            throw new CliError({
                message: `Group alias '${resolution.alias}' references non-existent group '${resolution.missingGroupName}'. Available groups: ${resolution.availableGroupNames.join(", ")}`,
                code: CliError.Code.ConfigError
            });
        }
        if (resolution.type === "unknown") {
            const aliases =
                resolution.availableAliasNames.length > 0
                    ? `; aliases: ${resolution.availableAliasNames.join(", ")}`
                    : "";
            throw new CliError({
                message: `SDK group '${resolution.name}' not found. Available groups: ${resolution.availableGroupNames.join(", ")}${aliases}`,
                code: CliError.Code.ConfigError
            });
        }
        return resolution.groupNames;
    });
}

async function promptGroupSelection({
    cliContext,
    choices,
    nonInteractiveError
}: {
    cliContext: CliContext;
    choices: Array<{ checked?: boolean; name: string; value: generatorsYml.GeneratorGroup }>;
    nonInteractiveError: string;
}): Promise<generatorsYml.GeneratorGroup[]> {
    if (!cliContext.isTTY) {
        throw new CliError({
            message: nonInteractiveError,
            code: CliError.Code.ConfigError
        });
    }
    const longestName = Math.max(...choices.map((choice) => choice.name.length));
    return cliContext.checkboxPrompt({
        message: "Select SDK groups to migrate (same API; one target per language):",
        required: true,
        validate: validateUniqueTargetLanguages,
        choices: choices.map((choice) => ({
            checked: choice.checked,
            name: `${choice.name.padEnd(longestName)}   ${chalk.dim(`[${targetLanguageLabel(choice.value)}]`)}   ${chalk.dim(`--group ${choice.name}`)}`,
            short: choice.name,
            value: choice.value
        }))
    });
}

function targetLanguages(group: generatorsYml.GeneratorGroup): string[] {
    return group.generators.flatMap((generator) => {
        const language = generator.language ?? getFernSdkGenApiLanguage(generator.name);
        return language == null ? [] : [language];
    });
}

function targetLanguageLabel(group: generatorsYml.GeneratorGroup): string {
    const languages = targetLanguages(group);
    if (languages.length > 0) {
        return summarizeValues(languages);
    }
    return group.generators.length === 0 ? "no targets" : "unknown target";
}

function validateUniqueTargetLanguages(groups: generatorsYml.GeneratorGroup[]): true | string {
    const selectedGroupsByLanguage = new Map<string, string[]>();
    for (const group of groups) {
        for (const generator of group.generators) {
            const language = generator.language ?? getFernSdkGenApiLanguage(generator.name);
            if (language == null) {
                continue;
            }
            const selectedGroups = selectedGroupsByLanguage.get(language) ?? [];
            selectedGroups.push(group.groupName);
            selectedGroupsByLanguage.set(language, selectedGroups);
        }
    }
    const conflicts = [...selectedGroupsByLanguage.entries()].filter(([, selectedGroups]) => selectedGroups.length > 1);
    if (conflicts.length === 0) {
        return true;
    }
    const summary = conflicts
        .map(([language, selectedGroups]) => `${language} (${summarizeValues(selectedGroups)})`)
        .join("; ");
    const hasConflictWithinGroup = conflicts.some(
        ([, selectedGroups]) => new Set(selectedGroups).size < selectedGroups.length
    );
    const hasConflictAcrossGroups = conflicts.some(([, selectedGroups]) => new Set(selectedGroups).size > 1);
    const guidance = [
        ...(hasConflictWithinGroup
            ? ["Split same-language generators into separate Fern groups, then migrate each group separately."]
            : []),
        ...(hasConflictAcrossGroups
            ? ["Select at most one conflicting group per language, or migrate those groups separately."]
            : []),
        "Use distinct outputs such as sdk-config.<group>.yml."
    ].join(" ");
    return `One SDK Config allows one target per language. Conflicts: ${summary}. ${guidance}`;
}

function summarizeValues(values: string[]): string {
    const counts = new Map<string, number>();
    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].map(([value, count]) => (count === 1 ? value : `${value} ×${count}`)).join(", ");
}

function assertUniqueTargetLanguages(groups: generatorsYml.GeneratorGroup[]): void {
    const result = validateUniqueTargetLanguages(groups);
    if (result !== true) {
        throw new CliError({
            message: result,
            code: CliError.Code.ConfigError
        });
    }
}

async function promptSelect<T>({
    cliContext,
    message,
    choices,
    nonInteractiveError,
    flagHint
}: {
    cliContext: CliContext;
    message: string;
    choices: Array<{ name: string; value: T }>;
    nonInteractiveError: string;
    flagHint: (value: T) => string;
}): Promise<T> {
    if (!cliContext.isTTY) {
        throw new CliError({
            message: nonInteractiveError,
            code: CliError.Code.ConfigError
        });
    }
    const longestName = Math.max(...choices.map((choice) => choice.name.length));
    return cliContext.selectPrompt({
        message,
        choices: choices.map((choice) => ({
            name: `${choice.name.padEnd(longestName)}   ${chalk.dim(flagHint(choice.value))}`,
            value: choice.value
        }))
    });
}

function workspaceNames(workspaces: AbstractAPIWorkspace<unknown>[]): string[] {
    return workspaces.map((workspace) => workspace.workspaceName ?? "default").sort();
}
