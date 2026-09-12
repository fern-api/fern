import { createOrganizationIfDoesNotExist, FernToken, getToken } from "@fern-api/auth";
import { ContainerRunner, Values } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import {
    type AutomationRunOptions,
    type FernSdkConfigV1Payload,
    getFernSdkGenApiLanguage
} from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext.js";
import { PREVIEW_DIRECTORY } from "../../constants.js";
import { checkOutputDirectory } from "./checkOutputDirectory.js";
import { expandGroupFilter } from "./expandGroupFilter.js";
import { filterGenerators } from "./filterGenerators.js";
import { generateWorkspace } from "./generateAPIWorkspace.js";
import { loadSdkConfigV1 } from "./loadSdkConfigV1.js";
import { PackMode } from "./packLocalOutput.js";
import { resolveGroupsForWorkspace } from "./resolveGroupsForWorkspace.js";
import { resolvePosthogCommandLabel } from "./resolvePosthogCommandLabel.js";
import { shouldPreflightGenerator } from "./shouldPreflightGenerator.js";

export const GenerationMode = {
    PullRequest: "pull-request"
} as const;

export type GenerationMode = Values<typeof GenerationMode>;

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupNames,
    generatorName,
    generatorIndex,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview,
    mode,
    force,
    runner,
    inspect,
    lfsOverride,
    sdkConfigPath,
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    outputDir,
    noReplay,
    verify,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    generateTests,
    referenceOptional,
    automation,
    pack,
    packMode,
    packOnly
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    /** One or more `--group` values. `undefined` means no `--group` was passed. */
    groupNames: string[] | undefined;
    generatorName: string | undefined;
    /** Index-based generator targeting (0-based). Used by `fern automations generate --generator 0`. */
    generatorIndex: number | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
    mode: GenerationMode | undefined;
    force: boolean;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    lfsOverride: string | undefined;
    sdkConfigPath?: string;
    fernignorePath: string | undefined;
    skipFernignore: boolean;
    dynamicIrOnly: boolean;
    outputDir: string | undefined;
    noReplay: boolean;
    verify: boolean;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
    skipIfNoDiff?: boolean;
    generateTests?: boolean;
    /**
     * When true, README.md / reference.md generation failures are tolerated: the generator warns and
     * skips the artifact instead of failing generation. Set by `fern generate --reference-optional`.
     */
    referenceOptional?: boolean;
    /**
     * When provided, this call runs in fan-out automation mode (see {@link AutomationRunOptions}).
     */
    automation?: AutomationRunOptions;
    /** Build distributable package artifacts for local-file-system outputs after generation. */
    pack?: boolean;
    /** Where packaging runs the toolchain: on the host or inside Docker toolchain images. */
    packMode?: PackMode;
    /** Keep only the fern-dist/ artifact in the output directory, removing the generated SDK source. */
    packOnly?: boolean;
}): Promise<void> {
    let token: FernToken | undefined = undefined;
    let sdkConfigV1: FernSdkConfigV1Payload | undefined;

    if (sdkConfigPath != null) {
        if (useLocalDocker) {
            return cliContext.failAndThrow(
                "SDK Config v1 generation is only supported with remote sdk-gen-api generation",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        try {
            const loaded = await loadSdkConfigV1(sdkConfigPath);
            sdkConfigV1 = loaded.payload;
            cliContext.logger.info(`Using SDK Config v1 from ${loaded.absolutePath}`);
        } catch (error) {
            return cliContext.failAndThrow(undefined, error, { code: CliError.Code.ConfigError });
        }
    }

    if (!useLocalDocker) {
        const currentToken = await cliContext.runTask(async (context) => {
            return askToLogin(context);
        });
        if (currentToken.type === "user") {
            await cliContext.runTask(async (context) => {
                await createOrganizationIfDoesNotExist({
                    organization: project.config.organization,
                    token: currentToken,
                    context
                });
            });
        }
        token = currentToken;
    } else {
        // Local generation must stay non-interactive: silently pick up an existing
        // token (FERN_TOKEN env var or saved login file) so Venus calls are
        // authenticated when possible, and leave `token` undefined otherwise.
        token = await getToken();
    }

    // Pre-flight: resolve groups for every selected workspace up front. If any workspace is
    // misconfigured for this invocation (e.g. `--group foo` targets a group that doesn't exist
    // in one of the `--api`-selected workspaces, or no `--group` was passed and one workspace
    // lacks a `default-group`), `resolveGroupsOrFail` throws before we start any generation.
    // We keep the resolved names so `generateWorkspace` doesn't need to re-run the resolver
    // (and re-log "Using default group '…' from generators.yml").
    const resolvedGroupNamesByWorkspace = await resolveGroupsForAllWorkspaces({
        project,
        groupNames,
        sdkConfigV1,
        automation,
        cliContext
    });
    if (sdkConfigV1 != null) {
        const selectedWorkspaces = [...resolvedGroupNamesByWorkspace.entries()].filter(
            ([, resolvedGroups]) => resolvedGroups.length > 0
        );
        if (selectedWorkspaces.length !== 1) {
            return cliContext.failAndThrow(
                `SDK Config v1 must resolve to exactly one API workspace; resolved ${selectedWorkspaces.length}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
    }

    await confirmOutputDirectoriesForEligibleGenerators({
        project,
        resolvedGroupNamesByWorkspace,
        generatorName,
        generatorIndex,
        automation,
        cliContext,
        force
    });

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: resolvePosthogCommandLabel(automation),
        properties: {
            workspaces: buildPosthogWorkspaces({ project, groupNames, generatorName })
        }
    });

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            const resolvedGroupNames = resolvedGroupNamesByWorkspace.get(workspace);
            // Workspaces skipped by the pre-flight (no generators.yml or no configured groups)
            // still need to run through `generateWorkspace` so the existing warning paths fire.
            // An undefined entry means "skipped"; an empty array would mean "resolved to nothing".
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const absolutePathToPreview = preview
                    ? outputDir != null
                        ? AbsoluteFilePath.of(resolve(cwd(), outputDir))
                        : join(workspace.absoluteFilePath, RelativeFilePath.of(PREVIEW_DIRECTORY))
                    : undefined;

                if (absolutePathToPreview != null) {
                    context.logger.info(`Writing preview to ${absolutePathToPreview}`);
                }

                await generateWorkspace({
                    organization: project.config.organization,
                    workspace,
                    projectConfig: project.config,
                    context,
                    version,
                    resolvedGroupNames: resolvedGroupNames ?? [],
                    generatorName,
                    generatorIndex,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker,
                    absolutePathToPreview,
                    mode,
                    runner,
                    inspect,
                    lfsOverride,
                    sdkConfigV1,
                    fernignorePath,
                    skipFernignore,
                    dynamicIrOnly,
                    noReplay,
                    verify,
                    retryRateLimited,
                    requireEnvVars,
                    automationMode,
                    autoMerge,
                    skipIfNoDiff,
                    generateTests,
                    referenceOptional,
                    automation,
                    pack,
                    packMode,
                    packOnly
                });
            });
        })
    );
}

/**
 * Pre-flight pass that resolves (and validates) the group list for every workspace the user
 * selected via `--api`. Any misconfiguration surfaces here — before generation starts — via
 * {@link resolveGroupsOrFail}'s `failAndThrow`, matching today's error rendering (workspace-
 * prefixed, same message text).
 *
 * Skips workspaces that have no `generators.yml` or no configured groups; those hit the
 * corresponding warn-and-return paths inside {@link generateWorkspace}.
 */
async function resolveGroupsForAllWorkspaces({
    project,
    groupNames,
    sdkConfigV1,
    automation,
    cliContext
}: {
    project: Project;
    groupNames: string[] | undefined;
    sdkConfigV1: FernSdkConfigV1Payload | undefined;
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
}): Promise<Map<AbstractAPIWorkspace<unknown>, string[]>> {
    const resolvedGroupNamesByWorkspace = new Map<AbstractAPIWorkspace<unknown>, string[]>();
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (sdkConfigV1 != null && (groupNames == null || groupNames.length === 0)) {
                    const resolved = resolveGroupsForSdkConfig({ workspace, sdkConfigV1, context });
                    resolvedGroupNamesByWorkspace.set(workspace, resolved);
                    return;
                }
                const resolved = resolveGroupsForWorkspace({
                    workspace,
                    groupNames,
                    isAutomation: automation != null,
                    context
                });
                if (resolved != null) {
                    resolvedGroupNamesByWorkspace.set(workspace, resolved);
                }
            });
        })
    );
    return resolvedGroupNamesByWorkspace;
}

export function resolveGroupsForSdkConfig({
    workspace,
    sdkConfigV1,
    context
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    sdkConfigV1: FernSdkConfigV1Payload;
    context: Parameters<typeof resolveGroupsForWorkspace>[0]["context"];
}): string[] {
    const generatorsConfiguration = workspace.generatorsConfiguration;
    if (generatorsConfiguration == null) {
        return context.failAndThrow(
            "SDK Config v1 generation requires generators.yml to load the Fern API workspace",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const requestedTargets = new Map(sdkConfigV1.targets.map((target) => [target.language, target]));
    const requestedLanguages = new Set(requestedTargets.keys());
    const candidates = generatorsConfiguration.groups.flatMap((group) => {
        const languages = group.generators.flatMap((generator) => {
            const language = getFernSdkGenApiLanguage(generator.name);
            if (language == null) {
                return [];
            }
            const target = requestedTargets.get(language);
            if (target == null || (target.generatorVersion != null && target.generatorVersion !== generator.version)) {
                return [];
            }
            return [language];
        });
        if (
            languages.length === 0 ||
            languages.length !== group.generators.length ||
            languages.some((language) => !requestedLanguages.has(language))
        ) {
            return [];
        }
        return [{ groupName: group.groupName, languages: new Set(languages) }];
    });
    const exactCovers = findMinimalExactGroupCovers(candidates, requestedLanguages);
    if (exactCovers.length === 0) {
        return context.failAndThrow(
            `SDK Config v1 targets (${[...requestedLanguages].join(", ")}) cannot be matched exactly to generator groups in ${generatorsConfiguration.absolutePathToConfiguration}. Pass --group explicitly or regenerate sdk-config.yml from the current Fern configuration.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const coversWithDefault = exactCovers.filter((cover) =>
        cover.some(({ groupName }) => groupName === generatorsConfiguration.defaultGroup)
    );
    const preferredCovers = coversWithDefault.length > 0 ? coversWithDefault : exactCovers;
    if (preferredCovers.length > 1) {
        const descriptions = preferredCovers
            .map((cover) =>
                cover
                    .map(({ groupName }) => groupName)
                    .sort()
                    .join(" + ")
            )
            .sort()
            .join("; ");
        return context.failAndThrow(
            `SDK Config v1 targets (${[...requestedLanguages].join(", ")}) match multiple generator group combinations: ${descriptions}. Pass --group explicitly.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return (preferredCovers[0] ?? []).map(({ groupName }) => groupName).sort();
}

interface SdkConfigGroupCandidate {
    groupName: string;
    languages: Set<string>;
}

function findMinimalExactGroupCovers(
    candidates: SdkConfigGroupCandidate[],
    requestedLanguages: Set<string>
): SdkConfigGroupCandidate[][] {
    const sortedCandidates = [...candidates].sort((left, right) => left.groupName.localeCompare(right.groupName));
    let minimumGroupCount = Number.POSITIVE_INFINITY;
    let covers: SdkConfigGroupCandidate[][] = [];

    const visit = (uncovered: Set<string>, selected: SdkConfigGroupCandidate[]): void => {
        if (uncovered.size === 0) {
            if (selected.length < minimumGroupCount) {
                minimumGroupCount = selected.length;
                covers = [[...selected]];
            } else if (selected.length === minimumGroupCount) {
                covers.push([...selected]);
            }
            return;
        }
        if (selected.length >= minimumGroupCount) {
            return;
        }
        const nextLanguage = [...uncovered].sort()[0];
        if (nextLanguage == null) {
            return;
        }
        for (const candidate of sortedCandidates) {
            if (
                !candidate.languages.has(nextLanguage) ||
                [...candidate.languages].some((language) => !uncovered.has(language))
            ) {
                continue;
            }
            const remaining = new Set(uncovered);
            for (const language of candidate.languages) {
                remaining.delete(language);
            }
            visit(remaining, [...selected, candidate]);
        }
    };

    visit(new Set(requestedLanguages), []);
    return covers;
}

/**
 * Walks the project's generators and prompts the user to confirm overwriting any local-file-system
 * output directories that already exist. Skips generators that wouldn't run anyway (per
 * {@link shouldPreflightGenerator}) to avoid noise when fanning out in automation mode.
 *
 * Throws via `cliContext.failAndThrow` if the user declines a prompt.
 */
async function confirmOutputDirectoriesForEligibleGenerators({
    project,
    resolvedGroupNamesByWorkspace,
    generatorName,
    generatorIndex,
    automation,
    cliContext,
    force
}: {
    project: Project;
    resolvedGroupNamesByWorkspace: Map<AbstractAPIWorkspace<unknown>, string[]>;
    generatorName: string | undefined;
    generatorIndex: number | undefined;
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
    force: boolean;
}): Promise<void> {
    for (const workspace of project.apiWorkspaces) {
        const resolvedGroupNames = resolvedGroupNamesByWorkspace.get(workspace);
        const rootAutorelease = workspace.generatorsConfiguration?.rawConfiguration.autorelease;
        const groupsInScope =
            resolvedGroupNames == null
                ? []
                : (workspace.generatorsConfiguration?.groups.filter((group) =>
                      resolvedGroupNames.includes(group.groupName)
                  ) ?? []);
        for (const group of groupsInScope) {
            const filterResult = filterGenerators({
                generators: group.generators,
                generatorIndex,
                generatorName,
                groupName: group.groupName
            });
            if (!filterResult.ok) {
                continue;
            }
            for (const generator of filterResult.generators) {
                if (!shouldPreflightGenerator({ generator, rootAutorelease, automation })) {
                    continue;
                }
                const { shouldProceed } = await checkOutputDirectory(
                    generator.absolutePathToLocalOutput,
                    cliContext,
                    force
                );
                if (!shouldProceed) {
                    cliContext.failAndThrow("Generation cancelled", undefined, { code: CliError.Code.ConfigError });
                }
            }
        }
    }
}

/** Builds the `workspaces` array for the posthog event, honoring `--group` / `--generator` filters. */
function buildPosthogWorkspaces({
    project,
    groupNames,
    generatorName
}: {
    project: Project;
    groupNames: string[] | undefined;
    generatorName: string | undefined;
}) {
    return project.apiWorkspaces.map((workspace) => {
        const resolvedGroupNames = expandGroupFilter(groupNames, workspace.generatorsConfiguration);
        return {
            name: workspace.workspaceName,
            group: groupNames != null && groupNames.length === 1 ? groupNames[0] : groupNames,
            generators: workspace.generatorsConfiguration?.groups
                .filter((group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName))
                .map((group) =>
                    group.generators
                        .filter((generator) => generatorName == null || generator.name === generatorName)
                        .map((generator) => ({
                            name: generator.name,
                            version: generator.version,
                            outputMode: generator.outputMode.type,
                            config: generator.config
                        }))
                )
        };
    });
}
