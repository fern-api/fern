import { getPackageNameFromGeneratorConfig } from "@fern-api/api-workspace-commons";
import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { getGeneratorOutputSubfolder, runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { askToLogin } from "@fern-api/login";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import fs from "fs/promises";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { GROUP_CLI_OPTION } from "../../constants.js";
import { isTelemetryDisabled } from "../../telemetry/isTelemetryDisabled.js";
import { computePreviewVersion } from "./computePreviewVersion.js";
import { getPreviewId } from "./getPreviewId.js";
import {
    getGithubOwnerRepo,
    isNpmGenerator,
    overrideGroupOutputForDiffBranch,
    overrideGroupOutputForDownload,
    overrideGroupOutputForPreview,
    PREVIEW_REGISTRY_URL
} from "./overrideOutputForPreview.js";
import { toPreviewPackageName } from "./toPreviewPackageName.js";

export interface SdkPreviewSuccess {
    status: "success";
    org: string;
    previews: Array<{
        preview_id: string;
        install: string;
        version: string;
        package_name: string;
        registry_url: string;
        output_path?: string;
        diff_url?: string;
    }>;
}

export interface SdkPreviewError {
    status: "error";
    message: string;
    code?: CliError.Code;
}

export type SdkPreviewResult = SdkPreviewSuccess | SdkPreviewError;

/**
 * Returns true if the value looks like a registry URL rather than a filesystem path.
 * Uses protocol prefix as the heuristic — a path like `https-backup/` would be
 * misclassified, but that's not a realistic output target.
 */
function isRegistryUrl(value: string): boolean {
    return value.startsWith("https://") || value.startsWith("http://");
}

export async function sdkPreview({
    cliContext,
    groupName,
    generatorFilter,
    apiName,
    output,
    local,
    pushDiff
}: {
    cliContext: CliContext;
    groupName: string | undefined;
    generatorFilter: string | undefined;
    apiName: string | undefined;
    output: string[] | undefined;
    local: boolean;
    pushDiff: boolean;
}): Promise<SdkPreviewResult> {
    const previews: SdkPreviewSuccess["previews"] = [];
    let organization: string | undefined;
    let registryUrl: string | undefined;
    let publishToRegistry = true;

    try {
        // Validate flag combinations early.
        // --push-diff requires remote generation and cannot be combined with --local.
        if (pushDiff && local) {
            return {
                status: "error",
                message: "--push-diff requires remote generation and cannot be combined with --local."
            };
        }

        // 1. Auth
        const token = await cliContext.runTask(async (context) => {
            return askToLogin(context);
        });
        if (token == null) {
            return {
                status: "error",
                message: "Authentication required. Run 'fern login' or set FERN_TOKEN.",
                code: CliError.Code.AuthError
            };
        }

        // 2. Load project
        const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
            commandLineApiWorkspace: apiName,
            defaultToAllApiWorkspaces: false
        });
        organization = project.config.organization;

        if (token.type === "user") {
            await cliContext.runTask(async (context) => {
                await createOrganizationIfDoesNotExist({
                    organization: project.config.organization,
                    token,
                    context
                });
            });
        }

        // 3. Resolve preview ID
        const previewId = await getPreviewId();
        cliContext.logger.info(`Preview ID: ${previewId}`);

        // 4. Resolve output targets from --output values.
        //
        // Each --output value is classified as a filesystem path or a registry URL.
        //   - No --output at all: temp dir + default preview registry
        //   - Only paths:         write to first path, no registry publish
        //   - Only URLs:          publish to first URL, no disk output
        //   - Paths + URLs:       write to first path + publish to first URL
        const pathOutputs = output?.filter((v) => !isRegistryUrl(v)) ?? [];
        const urlOutputs = output?.filter(isRegistryUrl) ?? [];

        if (pathOutputs.length > 1) {
            cliContext.logger.warn(`Multiple output paths provided; only the first will be used: ${pathOutputs[0]}`);
        }
        if (urlOutputs.length > 1) {
            cliContext.logger.warn(`Multiple registry URLs provided; only the first will be used: ${urlOutputs[0]}`);
        }

        // Determine whether to use remote (Fiddle) or local (Docker) generation.
        // By default, use remote generation through Fiddle (matches `fern generate` pattern).
        // --local flag forces local Docker generation.
        const useRemoteGeneration = !local;

        if (output == null) {
            // Default: publish to preview registry via Fiddle
            registryUrl = PREVIEW_REGISTRY_URL;
            publishToRegistry = true;
        } else if (urlOutputs.length > 0) {
            registryUrl = urlOutputs[0];
            publishToRegistry = true;
        } else {
            // Only paths, no URLs → disk-only mode
            registryUrl = undefined;
            publishToRegistry = false;
        }

        // When --output is given, resolve the first path for output.
        // For remote generation, absolutePathToPreview tells Fiddle to upload to S3
        // so the CLI can download the result to disk.
        // For local generation, it tells Docker where to write generated files.
        const firstPath = pathOutputs[0];
        const absolutePathToOutput = firstPath != null ? AbsoluteFilePath.of(resolve(cwd(), firstPath)) : undefined;
        if (absolutePathToOutput != null) {
            await fs.mkdir(absolutePathToOutput, { recursive: true });
        }

        // 5. Process each workspace
        for (const workspace of project.apiWorkspaces) {
            if (workspace.generatorsConfiguration == null) {
                cliContext.logger.warn(
                    `Workspace "${workspace.workspaceName}" has no ${GENERATORS_CONFIGURATION_FILENAME}`
                );
                continue;
            }

            // Resolve group
            const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration.defaultGroup;
            if (groupNameOrDefault == null) {
                return {
                    status: "error",
                    message: `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`,
                    code: CliError.Code.ConfigError
                };
            }

            const group = workspace.generatorsConfiguration.groups.find((g) => g.groupName === groupNameOrDefault);
            if (group == null) {
                return {
                    status: "error",
                    message: `Group '${groupNameOrDefault}' does not exist in ${GENERATORS_CONFIGURATION_FILENAME}`,
                    code: CliError.Code.ConfigError
                };
            }

            // Filter to a specific generator if --generator is provided
            const generators =
                generatorFilter != null ? group.generators.filter((g) => g.name === generatorFilter) : group.generators;

            if (generatorFilter != null && generators.length === 0) {
                return {
                    status: "error",
                    message: `Generator '${generatorFilter}' not found in group '${groupNameOrDefault}' in ${GENERATORS_CONFIGURATION_FILENAME}`,
                    code: CliError.Code.ConfigError
                };
            }

            // Filter to npm-only generators (SDK preview v1 limitation)
            const npmGenerators = generators.filter((g) => isNpmGenerator(g.name));
            const skippedGenerators = generators.filter((g) => !isNpmGenerator(g.name));
            for (const skipped of skippedGenerators) {
                cliContext.logger.warn(
                    `Skipping '${skipped.name}' — SDK preview currently only supports TypeScript/npm generators. ` +
                        `Use --generator to target a specific generator.`
                );
            }
            if (npmGenerators.length === 0) {
                return {
                    status: "error",
                    message:
                        `No supported generators found in group '${groupNameOrDefault}'. ` +
                        `SDK preview currently only supports TypeScript/npm generators.`,
                    code: CliError.Code.ConfigError
                };
            }

            for (const generator of npmGenerators) {
                const originalPackageName = getPackageNameFromGeneratorConfig(generator);
                if (originalPackageName == null) {
                    return {
                        status: "error",
                        message:
                            `Could not determine package name for generator '${generator.name}'. ` +
                            `Ensure 'output.package-name' is set in ${GENERATORS_CONFIGURATION_FILENAME}.`,
                        code: CliError.Code.ConfigError
                    };
                }

                const previewPackageName = toPreviewPackageName(originalPackageName, project.config.organization);
                const previewVersion = computePreviewVersion({ previewId });
                cliContext.logger.info(`Preview version: ${previewVersion}`);

                // Override group output to publish to the target registry.
                // token.value is the Fern org token (FERN_TOKEN) — the registry
                // must accept this token for publish authentication.
                const singleGeneratorGroup = { ...group, generators: [generator] };
                const githubInfo = getGithubOwnerRepo(generator.outputMode);

                // Warn if --push-diff was requested but the generator has no github config
                if (pushDiff && useRemoteGeneration && githubInfo == null) {
                    cliContext.logger.warn(
                        `Generator '${generator.name}' has no github output configuration. ` +
                            `--push-diff will be ignored; falling back to registry-only publish.`
                    );
                }

                // When --push-diff is active and the generator has GitHub config, we run
                // two separate generation jobs:
                //   Job 1 (publish): publishV2 mode with preview package name → npm publish
                //   Job 2 (diff):    githubV2(push) with original package name → clean diff branch
                // This ensures the diff branch shows real API changes without preview artifacts
                // (e.g. no @org-preview/ package rename).
                const shouldRunTwoJobs =
                    pushDiff && useRemoteGeneration && publishToRegistry && registryUrl != null && githubInfo != null;

                let publishGroup: generatorsYml.GeneratorGroup;
                if (publishToRegistry && registryUrl != null) {
                    publishGroup = overrideGroupOutputForPreview({
                        group: singleGeneratorGroup,
                        packageName: previewPackageName,
                        token: token.value,
                        registryUrl
                    });
                } else if (useRemoteGeneration) {
                    // Remote generation, disk-only (--output with no registry URL):
                    // override to downloadFiles so the generator doesn't try to publish
                    // using its original output mode.
                    publishGroup = overrideGroupOutputForDownload({ group: singleGeneratorGroup });
                } else {
                    publishGroup = singleGeneratorGroup;
                }

                if (useRemoteGeneration) {
                    const commonRemoteArgs = {
                        projectConfig: project.config,
                        organization: project.config.organization,
                        workspace,
                        shouldLogS3Url: false,
                        token,
                        whitelabel: workspace.generatorsConfiguration?.whitelabel,
                        mode: undefined as "pull-request" | undefined,
                        fernignorePath: undefined as string | undefined,
                        skipFernignore: false,
                        dynamicIrOnly: false,
                        validateWorkspace: true,
                        retryRateLimited: false,
                        requireEnvVars: false
                    };

                    // Job 1: Publish preview package to registry.
                    await cliContext.runTaskForWorkspace(workspace, async (context) => {
                        await runRemoteGenerationForAPIWorkspace({
                            ...commonRemoteArgs,
                            context,
                            generatorGroup: publishGroup,
                            version: previewVersion,
                            absolutePathToPreview: absolutePathToOutput,
                            isPreview: true,
                            fiddlePreview: false,
                            pushPreviewBranch: false
                        });
                    });

                    // Job 2: Push clean diff branch with original package metadata.
                    // Uses fiddlePreview=true so Fiddle sets dryRun=true, which prevents
                    // the publish override from firing (see GeneratorExecConfigFactory).
                    // The generator stays in github mode and produces clean output with
                    // the original package name; Fiddle pushes it to the diff branch.
                    if (shouldRunTwoJobs) {
                        const diffGroup = overrideGroupOutputForDiffBranch({ group: singleGeneratorGroup });
                        if (diffGroup.generators.length > 0) {
                            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                                await runRemoteGenerationForAPIWorkspace({
                                    ...commonRemoteArgs,
                                    context,
                                    generatorGroup: diffGroup,
                                    version: previewVersion,
                                    absolutePathToPreview: undefined,
                                    isPreview: true,
                                    fiddlePreview: true,
                                    pushPreviewBranch: true
                                });
                            });
                        }
                    }
                } else {
                    // Local generation via Docker — used when --local flag is provided.
                    // Docker must be installed. When absolutePathToOutput is set, generated
                    // files are also written to disk.
                    await cliContext.runTaskForWorkspace(workspace, async (context) => {
                        await runLocalGenerationForWorkspace({
                            token,
                            projectConfig: project.config,
                            workspace,
                            generatorGroup: publishGroup,
                            version: previewVersion,
                            keepDocker: false,
                            context,
                            absolutePathToPreview: absolutePathToOutput,
                            runner: undefined,
                            inspect: false,
                            ai: workspace.generatorsConfiguration?.ai,
                            replay: undefined,
                            noReplay: true,
                            validateWorkspace: true,
                            publishToRegistry,
                            isPreview: true,
                            disableTelemetry: isTelemetryDisabled()
                        });
                    });
                }

                // The generator writes to <output>/<subfolder>/ (e.g. fern-typescript-sdk/).
                // NOTE: this duplicates the subfolder logic in resolveAbsolutePathToLocalPreview
                // inside runLocalGenerationForWorkspace. Both call getGeneratorOutputSubfolder so
                // they stay in sync, but if the runner ever changes its path convention this will
                // need to be updated too.
                const actualOutputPath =
                    absolutePathToOutput != null
                        ? join(absolutePathToOutput, RelativeFilePath.of(getGeneratorOutputSubfolder(generator.name)))
                        : undefined;

                // Build the diff URL when --push-diff was used and the generator has GitHub config.
                const previewBranch = `fern-preview-${previewVersion}`;
                const diffUrl =
                    pushDiff && githubInfo != null
                        ? `https://github.com/${githubInfo.owner}/${githubInfo.repo}/compare/${previewBranch}`
                        : undefined;

                if (publishToRegistry && registryUrl != null) {
                    const installCommand = `npm install ${originalPackageName}@npm:${previewPackageName}@${previewVersion} --registry ${registryUrl}`;
                    previews.push({
                        preview_id: previewId,
                        install: installCommand,
                        version: previewVersion,
                        package_name: previewPackageName,
                        registry_url: registryUrl,
                        output_path: actualOutputPath,
                        diff_url: diffUrl
                    });
                } else {
                    previews.push({
                        preview_id: previewId,
                        install: "",
                        version: previewVersion,
                        package_name: previewPackageName,
                        registry_url: "",
                        output_path: actualOutputPath,
                        diff_url: diffUrl
                    });
                }
            }
        }
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : String(error)
        };
    }

    return { status: "success", org: organization ?? "", previews };
}
