import { getPackageNameFromGeneratorConfig } from "@fern-api/api-workspace-commons";
import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { askToLogin } from "@fern-api/login";

import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { GROUP_CLI_OPTION } from "../../constants.js";
import { computePreviewVersion, PREVIEW_REGISTRY_URL } from "./computePreviewVersion.js";
import { getPreviewId } from "./getPreviewId.js";
import { isNpmGenerator, overrideGroupOutputForPreview } from "./overrideOutputForPreview.js";

/**
 * Transforms a package name into a preview-scoped package name.
 * Uses the Fern org name to create a dedicated preview scope,
 * stripping any existing scope from the original package name.
 *
 * Examples (org = "fern"):
 *   @fern-fern/docs-parsers → @fern-preview/docs-parsers
 *   my-package → @fern-preview/my-package
 * Examples (org = "acme"):
 *   @acme/python-sdk → @acme-preview/python-sdk
 */
function toPreviewPackageName(packageName: string, org: string): string {
    const scopeMatch = packageName.match(/^@[^/]+\/(.+)$/);
    if (scopeMatch != null) {
        const [, name] = scopeMatch;
        return `@${org}-preview/${name}`;
    }
    return `@${org}-preview/${packageName}`;
}

interface SdkPreviewSuccess {
    status: "success";
    org: string;
    previews: Array<{
        preview_id: string;
        install: string;
        version: string;
        package_name: string;
        registry_url: string;
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
    json
}: {
    cliContext: CliContext;
    groupName: string | undefined;
    generatorFilter: string | undefined;
    apiName: string | undefined;
    json: boolean;
}): Promise<void> {
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

    const previews: SdkPreviewSuccess["previews"] = [];

    try {
        // 4. Process each workspace
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
                const previewVersion = await computePreviewVersion({ packageName: previewPackageName, previewId });
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
                // absolutePathToPreview is undefined — this is NOT preview-to-disk mode,
                // we want the generator to actually publish to the preview registry.
                await cliContext.runTaskForWorkspace(workspace, async (context) => {
                    await runLocalGenerationForWorkspace({
                        token,
                        projectConfig: project.config,
                        workspace,
                        generatorGroup: modifiedGroup,
                        version: previewVersion,
                        keepDocker: false,
                        context,
                        absolutePathToPreview: undefined,
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
                cliContext.logger.info(`→ ${installCommand}`);

                previews.push({
                    preview_id: previewId,
                    install: installCommand,
                    version: previewVersion,
                    package_name: previewPackageName,
                    registry_url: PREVIEW_REGISTRY_URL
                });
            }
        }
    } catch (error) {
        if (json) {
            const result: SdkPreviewResult = {
                status: "error",
                message: error instanceof Error ? error.message : String(error)
            };
            process.stdout.write(JSON.stringify(result, null, 2));
        }
        throw error;
    }

    // 5. Output result
    if (json) {
        const result: SdkPreviewResult = {
            status: "success",
            org: project.config.organization,
            previews
        };
        process.stdout.write(JSON.stringify(result, null, 2));
    }
}
