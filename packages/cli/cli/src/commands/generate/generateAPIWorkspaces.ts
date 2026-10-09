import path from "node:path";
import { createOrganizationIfDoesNotExist, FernToken, getToken } from "@fern-api/auth";
import { SDK_CONFIG_FILENAME } from "@fern-api/configuration-loader";
import { ContainerRunner, Values } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, dirname, doesPathExist, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { getCliReleaseEnvironment } from "@fern-api/posthog-manager";
import { Project } from "@fern-api/project-loader";
import {
    type AutomationRunOptions,
    type FernSdkConfigV1Payload,
    getFernSdkGenApiLanguage,
    resolveFernSdkGenApiEnabledByGenerator,
    selectGeneratorConfigRoute
} from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext.js";
import { PREVIEW_DIRECTORY } from "../../constants.js";
import { buildGeneratePosthogProperties, listRequestedGenerators } from "./buildGeneratePosthogProperties.js";
import { checkOutputDirectory } from "./checkOutputDirectory.js";
import { createSdkConfigWorkspace } from "./createSdkConfigWorkspace.js";
import { filterGenerators } from "./filterGenerators.js";
import { generateWorkspace } from "./generateAPIWorkspace.js";
import { getGeneratorSelectedTargetIndexes, loadSdkConfigV1 } from "./loadSdkConfigV1.js";
import { PackMode } from "./packLocalOutput.js";
import { resolveGroupsForWorkspace } from "./resolveGroupsForWorkspace.js";
import { resolvePosthogCommandLabel } from "./resolvePosthogCommandLabel.js";
import { getSdkConfigGeneratorName } from "./sdkConfigGeneratorName.js";
import { shouldPreflightGenerator } from "./shouldPreflightGenerator.js";

export const GenerationMode = {
    PullRequest: "pull-request"
} as const;

export type GenerationMode = Values<typeof GenerationMode>;

/** The files the local runner reads SDK Config from, in its lookup order. */
const LOCAL_RUNNER_SDK_CONFIG_FILENAMES: readonly string[] = [SDK_CONFIG_FILENAME, "sdk-config.yaml"];

interface WorkspaceGeneration {
    kind: "legacy" | "sdk-config";
    workspace: AbstractAPIWorkspace<unknown>;
    resolvedGroupNames: string[];
    generatorName?: string;
    generatorIndex?: number;
    sdkConfigV1?: FernSdkConfigV1Payload;
    sdkConfigPath?: string;
}

interface PreparedSdkConfigGeneration extends WorkspaceGeneration {
    kind: "sdk-config";
    configPath: string;
    cleanup: () => Promise<void>;
}

interface SdkConfigWorkspaceOwner {
    absoluteFilePath: AbsoluteFilePath;
    workspaceName: string | undefined;
    getAbsoluteFilePaths?: () => AbsoluteFilePath[];
}

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupNames,
    targetNames,
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
    automation,
    pack,
    packMode,
    packOnly,
    includePrivate
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    /** One or more `--group` values. `undefined` means no `--group` was passed. */
    groupNames: string[] | undefined;
    /** One or more SDK Config target languages supplied via `--target`. */
    targetNames: string[] | undefined;
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
     * When provided, this call runs in fan-out automation mode (see {@link AutomationRunOptions}).
     */
    automation?: AutomationRunOptions;
    /** Build distributable package artifacts for local-file-system outputs after generation. */
    pack?: boolean;
    /** Where packaging runs the toolchain: on the host or inside Docker toolchain images. */
    packMode?: PackMode;
    /** Keep only the fern-dist/ artifact in the output directory, removing the generated SDK source. */
    packOnly?: boolean;
    /** Include `x-twilio.libraryVisibility: private` OpenAPI elements in the generated SDK (`--private`). */
    includePrivate?: boolean;
}): Promise<void> {
    let token: FernToken | undefined = undefined;
    const cleanupSdkConfigWorkspaces: Array<() => Promise<void>> = [];

    try {
        const shouldGenerateLegacy =
            automation != null || groupNames != null || (targetNames == null && sdkConfigPath == null);
        const legacyProject: Project = {
            ...project,
            apiWorkspaces: shouldGenerateLegacy ? project.apiWorkspaces : []
        };
        const resolvedGroupNamesByWorkspace = await resolveGroupsForAllWorkspaces({
            project: legacyProject,
            groupNames,
            automation,
            cliContext
        });
        const legacyGenerations: WorkspaceGeneration[] = legacyProject.apiWorkspaces.map((workspace) => ({
            kind: "legacy",
            workspace,
            resolvedGroupNames: resolvedGroupNamesByWorkspace.get(workspace) ?? [],
            generatorName,
            generatorIndex
        }));
        const generations = [...legacyGenerations];

        if (
            (generatorName != null || generatorIndex != null) &&
            legacyGenerations.length === 0 &&
            (targetNames != null || sdkConfigPath == null)
        ) {
            return cliContext.failAndThrow(
                "--generator only filters generators in selected legacy groups. Add --group (and adjust --api if needed), or use --target to select an SDK Config target.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }

        const sdkConfigGenerations = await prepareSdkConfigGenerations({
            project,
            sdkConfigPath,
            targetNames,
            groupNames,
            generatorName,
            generatorIndex,
            preview,
            useLocalDocker,
            automation,
            cliContext
        });
        cleanupSdkConfigWorkspaces.push(...sdkConfigGenerations.map(({ cleanup }) => cleanup));
        generations.push(
            ...sdkConfigGenerations.map(({ cleanup: _cleanup, configPath, ...generation }) => ({
                ...generation,
                sdkConfigPath: configPath
            }))
        );

        if (generations.length === 0) {
            return cliContext.failAndThrow(
                "No generation configuration was selected. Check the --api selection and confirm the workspace contains generators.yml, generators.legacy.yml, or sdk-config.yml; use --group for a legacy group or --target for an SDK Config target.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }

        validateUniqueLanguageOwnership({ generations, cliContext });

        // Start the per-generator flag requests now so they overlap login and the output-directory prompts.
        // Values are memoized per process, so the remote runner reuses them. Local (Docker) generation never
        // routes through sdk-gen-api, so it makes no flag request. The helper never rejects, so the promise
        // cannot go unobserved if a prompt below throws first.
        const isAutomation = automation != null;
        const sdkGenApiEnabledByGenerator = useLocalDocker
            ? undefined
            : resolveFernSdkGenApiEnabledByGenerator({
                  organization: project.config.organization,
                  generatorNames: listRequestedGenerators({ generations, isAutomation }).map(({ name }) => name)
              });

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

        await confirmOutputDirectoriesForEligibleGenerators({
            generations,
            automation,
            cliContext,
            force
        });

        cliContext.instrumentPostHogEvent({
            orgId: project.config.organization,
            command: resolvePosthogCommandLabel(automation),
            properties: {
                ...buildGeneratePosthogProperties({
                    project,
                    generations,
                    isAutomation,
                    groupNames,
                    generatorName,
                    token,
                    sdkGenApiEnabledByGenerator: await sdkGenApiEnabledByGenerator,
                    cliReleaseEnvironment: getCliReleaseEnvironment()
                })
            }
        });

        await Promise.all(
            generations.map(async (generation) => {
                const { workspace } = generation;
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
                        resolvedGroupNames: generation.resolvedGroupNames,
                        generatorName: generation.generatorName,
                        generatorIndex: generation.generatorIndex,
                        shouldLogS3Url,
                        token,
                        useLocalDocker,
                        keepDocker,
                        absolutePathToPreview,
                        mode,
                        runner,
                        inspect,
                        lfsOverride,
                        sdkConfigV1: generation.sdkConfigV1,
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
                        automation,
                        pack,
                        packMode,
                        packOnly,
                        includePrivate
                    });
                });
            })
        );
    } finally {
        await Promise.all(cleanupSdkConfigWorkspaces.map((cleanup) => cleanup()));
    }
}

async function prepareSdkConfigGenerations({
    project,
    sdkConfigPath,
    targetNames,
    groupNames,
    generatorName,
    generatorIndex,
    preview,
    useLocalDocker,
    automation,
    cliContext
}: {
    project: Project;
    sdkConfigPath: string | undefined;
    targetNames: string[] | undefined;
    groupNames: string[] | undefined;
    generatorName: string | undefined;
    generatorIndex: number | undefined;
    preview: boolean;
    useLocalDocker: boolean;
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
}): Promise<PreparedSdkConfigGeneration[]> {
    if (automation != null) {
        return [];
    }
    const shouldUseSdkConfig =
        sdkConfigPath != null ||
        targetNames != null ||
        (groupNames == null && generatorName == null && generatorIndex == null);
    if (!shouldUseSdkConfig) {
        return [];
    }

    const sdkConfigWorkspaceOwners: SdkConfigWorkspaceOwner[] = [
        ...project.apiWorkspaces,
        ...(project.sdkConfigWorkspaces ?? [])
    ];
    const candidates: Array<{ path: string; owner?: SdkConfigWorkspaceOwner }> = [];
    if (sdkConfigPath != null) {
        const configDirectory = dirname(AbsoluteFilePath.of(resolve(cwd(), sdkConfigPath)));
        const matchingOwner = sdkConfigWorkspaceOwners.find((owner) => owner.absoluteFilePath === configDirectory);
        if (sdkConfigWorkspaceOwners.length > 1 && matchingOwner == null) {
            return cliContext.failAndThrow(
                `--sdk-config selects one file, but ${sdkConfigWorkspaceOwners.length} API workspaces are selected. Use --api to select exactly one API.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        candidates.push({ path: sdkConfigPath, owner: matchingOwner ?? sdkConfigWorkspaceOwners[0] });
    } else {
        for (const workspace of sdkConfigWorkspaceOwners) {
            const defaultPath = join(workspace.absoluteFilePath, RelativeFilePath.of(SDK_CONFIG_FILENAME));
            if (await doesPathExist(defaultPath)) {
                candidates.push({ path: defaultPath, owner: workspace });
            } else if (targetNames != null) {
                return cliContext.failAndThrow(
                    `No ${SDK_CONFIG_FILENAME} found for API '${workspace.workspaceName ?? "default"}'. Use --sdk-config to select another file.`,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
        }
        if (sdkConfigWorkspaceOwners.length === 0) {
            const fernDirectory = dirname(project.config._absolutePath);
            const defaultPath = join(fernDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
            if (await doesPathExist(defaultPath)) {
                candidates.push({ path: defaultPath });
            }
        }
    }

    if (targetNames != null && candidates.length === 0) {
        return cliContext.failAndThrow(
            `No ${SDK_CONFIG_FILENAME} found. Use --sdk-config to select an SDK Config file.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    // ponytail: the local runner rereads sdk-config.yml (else .yaml) from the config's directory, so
    // any other selected file cannot reach it. Thread the explicit path through the runner to lift this.
    if (useLocalDocker && sdkConfigPath != null) {
        const selectedPath = path.resolve(cwd(), sdkConfigPath);
        const localRunnerPath = await findLocalRunnerSdkConfig(path.dirname(selectedPath));
        if (selectedPath !== localRunnerPath) {
            return cliContext.failAndThrow(
                `--local reads ${path.basename(localRunnerPath ?? SDK_CONFIG_FILENAME)} from the directory of --sdk-config, so it cannot use ${path.basename(selectedPath)}. Rename the file to ${SDK_CONFIG_FILENAME}, or remove --local.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
    }

    const prepared: PreparedSdkConfigGeneration[] = [];
    try {
        for (const candidate of candidates) {
            const loaded = await loadSdkConfigV1(
                candidate.path,
                preview,
                targetNames != null ? { targetNames } : sdkConfigPath != null ? { generatorName, generatorIndex } : {}
            );
            if (sdkConfigPath != null) {
                const selectedTargetIndexes =
                    targetNames != null
                        ? new Set(loaded.config.targets.map((_, index) => index))
                        : getGeneratorSelectedTargetIndexes(loaded.config, { generatorName, generatorIndex });
                const selectedTargets = loaded.config.targets.filter((_, index) => selectedTargetIndexes.has(index));
                for (const target of selectedTargets) {
                    if (target.generatorVersion == null) {
                        continue;
                    }
                    const generatorId = getSdkConfigGeneratorName(target.language);
                    const language = generatorId == null ? undefined : getFernSdkGenApiLanguage(generatorId);
                    if (generatorId == null || language == null) {
                        continue;
                    }
                    const route = selectGeneratorConfigRoute({
                        generatorId,
                        language,
                        requestedVersion: target.generatorVersion
                    });
                    if (route.configKind === "legacy-fern") {
                        return cliContext.failAndThrow(
                            `--sdk-config cannot be used with ${generatorId} ${target.generatorVersion} because SDK Config support starts at ${route.cutoverVersion}. Use ${route.cutoverVersion} or later, or remove --sdk-config and configure the pre-cutover generator in generators.yml.`,
                            undefined,
                            { code: CliError.Code.ConfigError }
                        );
                    }
                }
            }
            const created = await cliContext.runTask(async (context) =>
                createSdkConfigWorkspace({
                    sdkConfig: loaded.config,
                    absolutePathToConfig: loaded.absolutePath,
                    sourceRoot: resolveSourceRoot(candidate.owner, loaded.absolutePath),
                    cliVersion: cliContext.environment.packageVersion,
                    workspaceName: candidate.owner?.workspaceName,
                    local: useLocalDocker,
                    context
                })
            );
            const sdkConfigGroup = created.workspace.generatorsConfiguration?.defaultGroup;
            if (sdkConfigGroup == null) {
                // This candidate has not entered `prepared`; clean it here, then let the catch clean earlier candidates.
                await created.cleanup();
                return cliContext.failAndThrow("SDK Config workspace has no generation targets", undefined, {
                    code: CliError.Code.ConfigError
                });
            }
            prepared.push({
                kind: "sdk-config",
                workspace: created.workspace,
                resolvedGroupNames: [sdkConfigGroup],
                ...(targetNames == null && sdkConfigPath != null ? { generatorName, generatorIndex } : {}),
                sdkConfigV1: loaded.payload,
                sdkConfigPath: loaded.absolutePath,
                configPath: loaded.absolutePath,
                cleanup: created.cleanup
            });
            cliContext.logger.info(`Using SDK Config v1 from ${loaded.absolutePath}`);
        }
        return prepared;
    } catch (error) {
        await Promise.all(prepared.map(({ cleanup }) => cleanup()));
        return cliContext.failAndThrow(undefined, error, { code: CliError.Code.ConfigError });
    }
}

async function findLocalRunnerSdkConfig(directory: string): Promise<string | undefined> {
    for (const filename of LOCAL_RUNNER_SDK_CONFIG_FILENAMES) {
        const candidate = path.join(directory, filename);
        if (await doesPathExist(AbsoluteFilePath.of(candidate), "file")) {
            return candidate;
        }
    }
    return undefined;
}

function resolveSourceRoot(
    owner: SdkConfigWorkspaceOwner | undefined,
    absolutePathToConfig: string
): string | undefined {
    if (owner?.getAbsoluteFilePaths == null) {
        return undefined;
    }
    return owner
        .getAbsoluteFilePaths()
        .reduce<string>(
            (boundary, absoluteFilePath) => commonAncestor(boundary, absoluteFilePath),
            path.dirname(path.resolve(absolutePathToConfig))
        );
}

function commonAncestor(candidateRoot: string, candidatePath: string): string {
    const resolvedPath = path.resolve(candidatePath);
    let root = path.resolve(candidateRoot);
    while (!isWithin(root, resolvedPath)) {
        const parent = path.dirname(root);
        if (parent === root) {
            return root;
        }
        root = parent;
    }
    return root;
}

function isWithin(directory: string, candidate: string): boolean {
    const relativePath = path.relative(directory, candidate);
    return relativePath === "" || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== "..");
}

function validateUniqueLanguageOwnership({
    generations,
    cliContext
}: {
    generations: WorkspaceGeneration[];
    cliContext: CliContext;
}): void {
    const ownersByWorkspace = new Map<string, Map<string, { kind: WorkspaceGeneration["kind"]; owner: string }>>();
    for (const generation of generations) {
        const workspaceName = generation.workspace.workspaceName ?? "default";
        let owners = ownersByWorkspace.get(workspaceName);
        if (owners == null) {
            owners = new Map();
            ownersByWorkspace.set(workspaceName, owners);
        }
        for (const { language, owner } of selectedLanguages(generation)) {
            const existing = owners.get(language);
            if (existing != null && existing.kind !== generation.kind) {
                cliContext.failAndThrow(
                    `API '${workspaceName}' selects language '${language}' from both ${existing.owner} and ${owner}. Remove one selector before generating.`,
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            owners.set(language, { kind: generation.kind, owner });
        }
    }
}

function selectedLanguages(generation: WorkspaceGeneration): Array<{ language: string; owner: string }> {
    if (generation.kind === "sdk-config") {
        return (
            generation.sdkConfigV1?.targets.map((target) => ({
                language: target.language,
                owner: generation.sdkConfigPath ?? SDK_CONFIG_FILENAME
            })) ?? []
        );
    }
    const groups =
        generation.workspace.generatorsConfiguration?.groups.filter((group) =>
            generation.resolvedGroupNames.includes(group.groupName)
        ) ?? [];
    return groups.flatMap((group) => {
        const filtered = filterGenerators({
            generators: group.generators,
            generatorName: generation.generatorName,
            generatorIndex: generation.generatorIndex,
            groupName: group.groupName
        });
        if (!filtered.ok) {
            return [];
        }
        return filtered.generators.flatMap((generator) => {
            const language = generator.language ?? getFernSdkGenApiLanguage(generator.name);
            return language == null ? [] : [{ language, owner: `legacy group '${group.groupName}'` }];
        });
    });
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
    automation,
    cliContext
}: {
    project: Project;
    groupNames: string[] | undefined;
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
}): Promise<Map<AbstractAPIWorkspace<unknown>, string[]>> {
    const resolvedGroupNamesByWorkspace = new Map<AbstractAPIWorkspace<unknown>, string[]>();
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
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

/**
 * Walks the project's generators and prompts the user to confirm overwriting any local-file-system
 * output directories that already exist. Skips generators that wouldn't run anyway (per
 * {@link shouldPreflightGenerator}) to avoid noise when fanning out in automation mode.
 *
 * Throws via `cliContext.failAndThrow` if the user declines a prompt.
 */
async function confirmOutputDirectoriesForEligibleGenerators({
    generations,
    automation,
    cliContext,
    force
}: {
    generations: WorkspaceGeneration[];
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
    force: boolean;
}): Promise<void> {
    for (const generation of generations) {
        const { workspace, resolvedGroupNames, generatorName, generatorIndex } = generation;
        const rootAutorelease = workspace.generatorsConfiguration?.rawConfiguration.autorelease;
        const groupsInScope =
            workspace.generatorsConfiguration?.groups.filter((group) => resolvedGroupNames.includes(group.groupName)) ??
            [];
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
