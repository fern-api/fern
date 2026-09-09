import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import type { Project } from "@fern-api/project-loader";
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
    return {
        workspace,
        groups: await selectGroups(configuration, cliContext, args.group)
    };
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
        requestedGroups ?? (configuration.defaultGroup == null ? undefined : [configuration.defaultGroup]);
    if (groupNames == null) {
        const onlyGroup = configuration.groups[0];
        if (configuration.groups.length === 1 && onlyGroup != null) {
            return [onlyGroup];
        }
        const names = configuration.groups.map((group) => group.groupName);
        return [
            await promptSelect({
                cliContext,
                message: "Multiple SDK groups found. Select one:",
                choices: configuration.groups.map((group) => ({
                    name: group.groupName,
                    value: group
                })),
                nonInteractiveError: `Multiple SDK groups found: ${names.join(", ")}. Use --group to select one.`,
                flagHint: (group) => `--group ${group.groupName}`
            })
        ];
    }

    const availableGroupNames = configuration.groups.map((group) => group.groupName);
    const resolvedNames = groupNames.flatMap((groupName) => {
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
    const uniqueNames = [...new Set(resolvedNames)];
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
