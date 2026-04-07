import { getPackageNameFromGeneratorConfig } from "@fern-api/api-workspace-commons";
import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { getGeneratorOutputSubfolder, runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { askToLogin } from "@fern-api/login";
import fs from "fs/promises";

import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { GROUP_CLI_OPTION } from "../../constants.js";
import { computePreviewVersion } from "./computePreviewVersion.js";

import { getPreviewId } from "./getPreviewId.js";
import { isNpmGenerator, overrideGroupOutputForPreview, PREVIEW_REGISTRY_URL } from "./overrideOutputForPreview.js";
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

export async function sdkPreview({
    cliContext,
    groupName,
    generatorFilter,
    apiName,
    json,
    output
}: {
    cliContext: CliContext;
    groupName: string | undefined;
    generatorFilter: string | undefined;
    apiName: string | undefined;
    json: boolean;
    output: string | undefined;
}): Promise<void> {
    const previews: SdkPreviewSuccess["previews"] = [];
    let organization: string | undefined;

    try {
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

        // 4. Resolve output path (opt-in, used by CI actions for SDK diffs)
        //
        // When --output is set, absolutePathToPreview becomes non-null in
        // runLocalGenerationForWorkspace, which sets isPreview = true. This
        // intentionally enables two preview-mode behaviors:
        //   - Missing env vars are substituted as empty strings (instead of failing)
        //   - Version availability checks are skipped
        // Both are correct for CI preview runs where prod secrets aren't available.
        const absolutePathToOutput = output != null ? AbsoluteFilePath.of(resolve(cwd(), output)) : undefined;
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

                // Override group output to publish to preview registry.
                // token.value is the Fern org token (FERN_TOKEN) — the preview registry
                // must accept this token for publish authentication.
                const modifiedGroup = overrideGroupOutputForPreview({
                    group: { ...group, generators: [generator] },
                    packageName: previewPackageName,
                    token: token.value
                });

                // Run generation locally via Docker. We use local generation (not remote/Fiddle)
                // because we programmatically override the output config, which requires direct
                // control over the generator invocation. Docker must be installed.
                //
                // When --output is provided (CI mode), absolutePathToPreview is set so the
                // generator also writes files to disk for SDK diff workflows.
                // When not provided (interactive CLI), only registry publishing occurs.
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
                        publishToRegistry: true
                    });
                });

                const installCommand = `npm install ${originalPackageName}@npm:${previewPackageName}@${previewVersion} --registry ${PREVIEW_REGISTRY_URL}`;

                // The generator writes to <output>/<subfolder>/ (e.g. fern-typescript-sdk/).
                const actualOutputPath =
                    absolutePathToOutput != null
                        ? join(absolutePathToOutput, RelativeFilePath.of(getGeneratorOutputSubfolder(generator.name)))
                        : undefined;

                previews.push({
                    preview_id: previewId,
                    install: installCommand,
                    version: previewVersion,
                    package_name: previewPackageName,
                    registry_url: PREVIEW_REGISTRY_URL,
                    ...(actualOutputPath != null && {
                        output_path: actualOutputPath
                    })
                });
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
        cliContext.logger.info(`Published ${previews.length} preview package${previews.length > 1 ? "s" : ""}:`);
        for (const preview of previews) {
            cliContext.logger.info("");
            cliContext.logger.info(`  ${preview.package_name}@${preview.version}`);
            cliContext.logger.info(`  Install: ${preview.install}`);
        }
    }
}
