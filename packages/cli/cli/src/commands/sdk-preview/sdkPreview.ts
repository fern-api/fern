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
import { overrideGroupOutputForPreview } from "./overrideOutputForPreview.js";

export interface SdkPreviewResult {
    status: "success" | "error";
    org: string;
    previews: Array<{
        preview_id: string;
        install: string;
        version: string;
        package_name: string;
        registry_url: string;
    }>;
}

export async function sdkPreview({
    cliContext,
    groupName,
    json
}: {
    cliContext: CliContext;
    groupName: string | undefined;
    json: boolean;
}): Promise<void> {
    // 1. Auth
    const token = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });
    if (token == null) {
        cliContext.failAndThrow("Authentication required. Run 'fern login' or set FERN_TOKEN.");
        return;
    }

    // 2. Load project
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
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
    const previewId = getPreviewId();
    cliContext.logger.info(`Preview ID: ${previewId}`);

    const previews: SdkPreviewResult["previews"] = [];

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
            cliContext.failAndThrow(
                `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
            );
            return;
        }

        const group = workspace.generatorsConfiguration.groups.find((g) => g.groupName === groupNameOrDefault);
        if (group == null) {
            cliContext.failAndThrow(
                `Group '${groupNameOrDefault}' does not exist in ${GENERATORS_CONFIGURATION_FILENAME}`
            );
            return;
        }

        // For each generator in the group, extract package name and compute preview version
        for (const generator of group.generators) {
            const packageName = getPackageNameFromGeneratorConfig(generator);
            if (packageName == null) {
                cliContext.failAndThrow(
                    `Could not determine package name for generator '${generator.name}'. ` +
                        `Ensure 'output.package-name' is set in ${GENERATORS_CONFIGURATION_FILENAME}.`
                );
                return;
            }

            const previewVersion = await computePreviewVersion({ packageName, previewId });
            cliContext.logger.info(`Preview version: ${previewVersion}`);

            // Override group output to publish to preview registry
            const modifiedGroup = overrideGroupOutputForPreview({
                group: { ...group, generators: [generator] },
                packageName,
                previewVersion,
                token: token.value
            });

            // Run generation with the modified group
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                await runLocalGenerationForWorkspace({
                    token,
                    projectConfig: project.config,
                    workspace,
                    generatorGroup: modifiedGroup,
                    version: previewVersion,
                    keepDocker: false,
                    context,
                    absolutePathToPreview: undefined, // Not preview mode — we want actual publishing
                    runner: undefined,
                    inspect: false,
                    ai: workspace.generatorsConfiguration?.ai,
                    replay: undefined,
                    noReplay: true,
                    validateWorkspace: true
                });
            });

            const installCommand = `npm install ${packageName}@${previewVersion} --registry ${PREVIEW_REGISTRY_URL}`;
            cliContext.logger.info(`→ ${installCommand}`);

            previews.push({
                preview_id: previewId,
                install: installCommand,
                version: previewVersion,
                package_name: packageName,
                registry_url: PREVIEW_REGISTRY_URL
            });
        }
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
