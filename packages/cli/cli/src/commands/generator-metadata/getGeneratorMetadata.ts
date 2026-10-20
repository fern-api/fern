import {
    addDefaultDockerOrgIfNotPresent,
    generatorsYml,
    loadGeneratorsConfiguration
} from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { Project } from "@fern-api/project-loader";
import { isApiSelected, SDK_CONFIG_FILENAME } from "@fern-api/project-structure";
import { CliError } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext.js";
import { loadSdkConfigTargets, type SdkConfigTargetSource } from "../generator-list/loadSdkConfigTargets.js";

export interface GeneratorMetadata {
    /** Names the selection in warnings, e.g. `generator fernapi/fern-java-sdk in group java-sdk`. */
    description: string;
    version: string;
    language: string | undefined;
    repository: string | undefined;
}

export type GeneratorGetSelection =
    | { type: "target"; target: string }
    | { type: "group"; generator: string; group: string };

/**
 * Validates the `fern generator get` selectors: an SDK Config `--target`, or a legacy `--group` with `--generator`.
 *
 * Checked here rather than in a yargs `.check()`, whose thrown errors the CLI's global `.fail()` handler drops.
 */
export function resolveGeneratorGetSelection({
    cliContext,
    target,
    group,
    generator
}: {
    cliContext: CliContext;
    target: string | undefined;
    group: string | undefined;
    generator: string | undefined;
}): GeneratorGetSelection {
    if (target != null) {
        if (group != null || generator != null) {
            return cliContext.failAndThrow("Use --target, or --group with --generator, not both.", undefined, {
                code: CliError.Code.ConfigError
            });
        }
        return { type: "target", target };
    }
    if (group == null || generator == null) {
        return cliContext.failAndThrow(
            "Specify --target for an SDK Config target, or both --group and --generator for a generators.yml generator.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return { type: "group", generator, group };
}

export async function getSelectedGeneratorMetadata({
    cliContext,
    selection,
    apiFilter,
    project
}: {
    cliContext: CliContext;
    selection: GeneratorGetSelection;
    apiFilter: string | undefined;
    project: Project;
}): Promise<GeneratorMetadata> {
    switch (selection.type) {
        case "target":
            return getSdkConfigTargetMetadata({ cliContext, targetFilter: selection.target, apiFilter, project });
        case "group":
            return getGeneratorMetadata({
                cliContext,
                generatorFilter: selection.generator,
                groupFilter: selection.group,
                apiFilter,
                project
            });
        default:
            assertNever(selection);
    }
}

/** Finds a generator in a legacy generators.yml group; fails naming the files inspected when it is absent. */
export async function getGeneratorMetadata({
    cliContext,
    generatorFilter,
    groupFilter,
    apiFilter,
    project
}: {
    cliContext: CliContext;
    generatorFilter: string;
    groupFilter: string;
    apiFilter: string | undefined;
    project: Project;
}): Promise<GeneratorMetadata> {
    // Normalize the generator filter to add default Docker org prefix if not present
    const normalizedGeneratorFilter = addDefaultDockerOrgIfNotPresent(generatorFilter);
    let maybeGenerator: generatorsYml.GeneratorInvocation | undefined;
    const inspectedConfigurations: string[] = [];
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // If the current API workspace is not in the specified APIs, skip it
                if (!isApiSelected(workspace.workspaceName, apiFilter)) {
                    return;
                }

                // If there are no groups in the configuration, skip this workspace
                const generatorsConfiguration = await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context
                });
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    return;
                }
                inspectedConfigurations.push(generatorsConfiguration.absolutePathToConfiguration);

                for (const group of generatorsConfiguration.groups) {
                    // If the current group is not in the specified groups, skip it
                    if (groupFilter !== group.groupName) {
                        continue;
                    }

                    for (const generator of group.generators) {
                        if (normalizedGeneratorFilter === generator.name) {
                            maybeGenerator = generator;
                        }
                    }
                }
            });
        })
    );

    if (maybeGenerator != null) {
        return {
            description: `generator ${maybeGenerator.name} in group ${groupFilter}`,
            version: maybeGenerator.version,
            language: maybeGenerator.language,
            repository: getRepository(maybeGenerator.outputMode)
        };
    }

    const inspected =
        inspectedConfigurations.length > 0
            ? ` in ${[...inspectedConfigurations].sort().join(", ")}`
            : "; no generators.yml with groups was found";
    // After `fern sdk migrate`, the generator lives on as an SDK Config target; point there instead
    const migratedTarget = (await getSelectedSdkConfigSources({ project, cliContext, apiFilter }))
        .flatMap((source) => source.targets.map((target) => ({ source, target })))
        .find(({ target }) => target.generator === normalizedGeneratorFilter);
    const migrationHint =
        migratedTarget != null
            ? ` It is configured as SDK Config target '${migratedTarget.target.id}' in ${migratedTarget.source.absolutePathToSdkConfig}; use --target ${migratedTarget.target.id}.`
            : "";
    return cliContext.failAndThrow(
        `Generator ${generatorFilter}, in group ${groupFilter}${forApi(apiFilter)} was not found${inspected}.${migrationHint}`,
        undefined,
        { code: CliError.Code.ConfigError }
    );
}

/**
 * Finds one SDK Config target by language, or by id (`java-1`) when a language repeats. Fails naming the
 * sdk-config.yml files inspected when nothing matches, or when the selection matches more than one target.
 */
export async function getSdkConfigTargetMetadata({
    cliContext,
    targetFilter,
    apiFilter,
    project
}: {
    cliContext: CliContext;
    targetFilter: string;
    apiFilter: string | undefined;
    project: Project;
}): Promise<GeneratorMetadata> {
    const sources = await getSelectedSdkConfigSources({ project, cliContext, apiFilter });
    if (sources.length === 0) {
        return cliContext.failAndThrow(
            `No ${SDK_CONFIG_FILENAME} was found${forApi(apiFilter)}. Use --group and --generator to select a generator from generators.yml.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const matches = sources.flatMap((source) =>
        source.targets
            .filter((target) => target.id === targetFilter || target.language === targetFilter)
            .map((target) => ({ source, target }))
    );
    const inspected = sources.map((source) => source.absolutePathToSdkConfig).join(", ");
    const [match, ...otherMatches] = matches;
    if (match == null) {
        const available = [...new Set(sources.flatMap((source) => source.targets.map((target) => target.id)))];
        return cliContext.failAndThrow(
            `SDK Config target '${targetFilter}' was not found in ${inspected}. Available targets: ${available.length > 0 ? available.join(", ") : "none"}.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if (otherMatches.length > 0) {
        const spansApis = new Set(matches.map(({ source }) => source.workspaceName)).size > 1;
        return cliContext.failAndThrow(
            `--target ${targetFilter} matches ${matches.length} SDK Config targets (${matches.map(({ target }) => target.id).join(", ")}) in ${inspected}, but generator get reads exactly one. ` +
                (spansApis
                    ? "Use --api to select one API."
                    : `Pass a target id instead, e.g. --target ${match.target.id}.`),
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const { target } = match;
    return {
        description: `SDK Config target ${target.id}`,
        version: target.version,
        language: target.language,
        repository: target.output?.delivery === "github" ? target.output.github.repository : undefined
    };
}

function getSelectedSdkConfigSources({
    project,
    cliContext,
    apiFilter
}: {
    project: Project;
    cliContext: CliContext;
    apiFilter: string | undefined;
}): Promise<SdkConfigTargetSource[]> {
    return loadSdkConfigTargets({
        project,
        cliContext,
        isSelectedApi: (workspaceName) => isApiSelected(workspaceName, apiFilter)
    });
}

function forApi(apiFilter: string | undefined): string {
    return apiFilter != null ? ` for API ${apiFilter}` : "";
}

function getRepository(outputMode: generatorsYml.GeneratorInvocation["outputMode"]): string | undefined {
    return outputMode.type === "github"
        ? outputMode.repo
        : outputMode.type === "githubV2"
          ? outputMode.githubV2.repo
          : undefined;
}
