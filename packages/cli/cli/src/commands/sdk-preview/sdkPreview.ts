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
import fs from "fs/promises";

import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { GROUP_CLI_OPTION } from "../../constants.js";
import { computePreviewVersion } from "./computePreviewVersion.js";

import { getPreviewId } from "./getPreviewId.js";
import {
    getGithubOwnerRepo,
    isNpmGenerator,
    overrideGroupOutputForDownload,
    overrideGroupOutputForPreview,
    PREVIEW_REGISTRY_URL
} from "./overrideOutputForPreview.js";
import { toPreviewPackageName } from "./toPreviewPackageName.js";

interface SdkPreviewSuccess {
    status: "success";
    org: string;
    previews: Array<{
        preview_id: string;
        install: string;
        version: string;
        package_name: string;
        registry_url: string;
        output_path?: string;
    }>;
}

interface SdkPreviewError {
    status: "error";
    message: string;
}

type SdkPreviewResult = SdkPreviewSuccess | SdkPreviewError;

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
    json,
    output,
    local,
    pushDiff
}: {
    cliContext: CliContext;
    groupName: string | undefined;
    generatorFilter: string | undefined;
    apiName: string | undefined;
    json: boolean;
    output: string[] | undefined;
    local: boolean;
    pushDiff: boolean;
}): Promise<void> {
    const previews: SdkPreviewSuccess["previews"] = [];
    let organization: string | undefined;
    let registryUrl: string | undefined;
    let publishToRegistry = true;

    try {
        // Validate flag combinations early.
        // --push-diff requires remote generation and cannot be combined with --local.
        if (pushDiff && local) {
            return cliContext.failAndThrow(
                "--push-diff requires remote generation and cannot be combined with --local."
            );
        }

        // --push-diff is gated until the fiddle-sdk is bumped to include the
        // pushPreviewBranch field on CreateJobRequestV2. Without it, Fiddle would
        // receive a githubV2(push) job without pushPreviewBranch=true and treat it
        // as a normal push — writing to the default branch, which is dangerous.
        if (pushDiff) {
            return cliContext.failAndThrow(
                "--push-diff is not yet available. It requires a server-side update that has not been deployed."
            );
        }

        // 1. Auth
        const token = await cliContext.runTask(async (context) => {
            return askToLogin(context);
        });
        if (token == null) {
            return cliContext.failAndThrow("Authentication required. Run 'fern login' or set FERN_TOKEN.");
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
                return cliContext.failAndThrow(
                    `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
                );
            }

            const group = workspace.generatorsConfiguration.groups.find((g) => g.groupName === groupNameOrDefault);
            if (group == null) {
                return cliContext.failAndThrow(
                    `Group '${groupNameOrDefault}' does not exist in ${GENERATORS_CONFIGURATION_FILENAME}`
                );
            }

            // Filter to a specific generator if --generator is provided
            const generators =
                generatorFilter != null ? group.generators.filter((g) => g.name === generatorFilter) : group.generators;

            if (generatorFilter != null && generators.length === 0) {
                return cliContext.failAndThrow(
                    `Generator '${generatorFilter}' not found in group '${groupNameOrDefault}' in ${GENERATORS_CONFIGURATION_FILENAME}`
                );
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
                return cliContext.failAndThrow(
                    `No supported generators found in group '${groupNameOrDefault}'. ` +
                        `SDK preview currently only supports TypeScript/npm generators.`
                );
            }

            for (const generator of npmGenerators) {
                const originalPackageName = getPackageNameFromGeneratorConfig(generator);
                if (originalPackageName == null) {
                    return cliContext.failAndThrow(
                        `Could not determine package name for generator '${generator.name}'. ` +
                            `Ensure 'output.package-name' is set in ${GENERATORS_CONFIGURATION_FILENAME}.`
                    );
                }

                const previewPackageName = toPreviewPackageName(originalPackageName, project.config.organization);
                const previewVersion = computePreviewVersion({ previewId });
                cliContext.logger.info(`Preview version: ${previewVersion}`);

                // Override group output to publish to the target registry.
                // token.value is the Fern org token (FERN_TOKEN) — the registry
                // must accept this token for publish authentication.
                const singleGeneratorGroup = { ...group, generators: [generator] };
                // Warn if --push-diff was requested but the generator has no github config
                if (pushDiff && useRemoteGeneration && getGithubOwnerRepo(generator.outputMode) == null) {
                    cliContext.logger.warn(
                        `Generator '${generator.name}' has no github output configuration. ` +
                            `--push-diff will be ignored; falling back to registry-only publish.`
                    );
                }

                let modifiedGroup: generatorsYml.GeneratorGroup;
                if (publishToRegistry && registryUrl != null) {
                    modifiedGroup = overrideGroupOutputForPreview({
                        group: singleGeneratorGroup,
                        packageName: previewPackageName,
                        token: token.value,
                        registryUrl,
                        pushDiff: useRemoteGeneration ? pushDiff : undefined
                    });
                } else if (useRemoteGeneration) {
                    // Remote generation, disk-only (--output with no registry URL):
                    // override to downloadFiles so the generator doesn't try to publish
                    // using its original output mode.
                    modifiedGroup = overrideGroupOutputForDownload({ group: singleGeneratorGroup });
                } else {
                    modifiedGroup = singleGeneratorGroup;
                }

                if (useRemoteGeneration) {
                    // Remote generation through Fiddle — matches the `fern generate` pattern.
                    // Fiddle handles publishing to the preview registry server-side.
                    // When absolutePathToOutput is set (--output), Fiddle uploads to S3 and
                    // the CLI downloads the result to the specified path.
                    await cliContext.runTaskForWorkspace(workspace, async (context) => {
                        await runRemoteGenerationForAPIWorkspace({
                            projectConfig: project.config,
                            organization: project.config.organization,
                            workspace,
                            context,
                            generatorGroup: modifiedGroup,
                            version: previewVersion,
                            shouldLogS3Url: false,
                            token,
                            whitelabel: workspace.generatorsConfiguration?.whitelabel,
                            absolutePathToPreview: absolutePathToOutput,
                            // isPreview controls CLI-side behavior: lenient env var substitution,
                            // skip version availability check, skip dynamic IR upload.
                            isPreview: true,
                            // fiddlePreview controls what's sent to Fiddle as the `preview` flag.
                            // We explicitly send false so Fiddle doesn't set dryRun=true (which
                            // would cause `npm publish --dry-run` instead of actually publishing).
                            fiddlePreview: false,
                            pushPreviewBranch: pushDiff,
                            mode: undefined,
                            fernignorePath: undefined,
                            skipFernignore: false,
                            dynamicIrOnly: false,
                            validateWorkspace: true,
                            retryRateLimited: false,
                            requireEnvVars: false
                        });
                    });
                } else {
                    // Local generation via Docker — used when --local flag is provided.
                    // Docker must be installed. When absolutePathToOutput is set, generated
                    // files are also written to disk.
                    await cliContext.runTaskForWorkspace(workspace, async (context) => {
                        await runLocalGenerationForWorkspace({
                            token,
                            projectConfig: project.config,
                            workspace,
                            generatorGroup: modifiedGroup,
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
                            isPreview: true
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

                if (publishToRegistry && registryUrl != null) {
                    const installCommand = `npm install ${originalPackageName}@npm:${previewPackageName}@${previewVersion} --registry ${registryUrl}`;
                    previews.push({
                        preview_id: previewId,
                        install: installCommand,
                        version: previewVersion,
                        package_name: previewPackageName,
                        registry_url: registryUrl,
                        output_path: actualOutputPath
                    });
                } else {
                    previews.push({
                        preview_id: previewId,
                        install: "",
                        version: previewVersion,
                        package_name: previewPackageName,
                        registry_url: "",
                        output_path: actualOutputPath
                    });
                }
            }
        }
    } catch (error) {
        if (json) {
            const result: SdkPreviewResult = {
                status: "error",
                message: error instanceof Error ? error.message : String(error)
            };
            process.stdout.write(JSON.stringify(result, null, 2) + "\n");
            process.exitCode = 1;
            return;
        }
        throw error;
    }

    // 6. Output result
    if (json) {
        const result: SdkPreviewResult = {
            status: "success",
            org: organization ?? "",
            previews
        };
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } else if (previews.length > 0) {
        cliContext.logger.info("");
        if (publishToRegistry) {
            cliContext.logger.info(`Published ${previews.length} preview package${previews.length > 1 ? "s" : ""}:`);
            for (const preview of previews) {
                cliContext.logger.info("");
                cliContext.logger.info(`  ${preview.package_name}@${preview.version}`);
                cliContext.logger.info(`  Install: ${preview.install}`);
                if (preview.output_path) {
                    cliContext.logger.info(`  Output: ${preview.output_path}`);
                }
            }
        } else {
            cliContext.logger.info(`Generated ${previews.length} preview SDK${previews.length > 1 ? "s" : ""}:`);
            for (const preview of previews) {
                cliContext.logger.info("");
                cliContext.logger.info(`  ${preview.package_name}@${preview.version}`);
                cliContext.logger.info(`  Output: ${preview.output_path}`);
            }
        }
    }
}
