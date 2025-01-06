import { FernToken, createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { Values } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { PREVIEW_DIRECTORY } from "../../constants";
import { checkOutputDirectory } from "./checkOutputDirectory";
import { generateWorkspace } from "./generateAPIWorkspace";

export const GenerationMode = {
    PullRequest: "pull-request"
} as const;

export type GenerationMode = Values<typeof GenerationMode>;

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview,
    mode,
    force
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
    mode: GenerationMode | undefined;
    force: boolean;
}): Promise<void> {
    let token: FernToken | undefined = undefined;

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
    }

    for (const workspace of project.apiWorkspaces) {
        for (const generator of workspace.generatorsConfiguration?.groups.flatMap((group) => group.generators) ?? []) {
            const { shouldProceed } = await checkOutputDirectory(
                generator.absolutePathToLocalOutput,
                cliContext,
                force
            );
            if (!shouldProceed) {
                cliContext.failAndThrow("Generation cancelled");
            }
        }
    }

    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate",
        properties: {
            workspaces: project.apiWorkspaces.map((workspace) => {
                return {
                    name: workspace.workspaceName,
                    group: groupName,
                    generators: workspace.generatorsConfiguration?.groups
                        .filter((group) => (groupName == null ? true : group.groupName === groupName))
                        .map((group) => {
                            return group.generators.map((generator) => {
                                return {
                                    name: generator.name,
                                    version: generator.version,
                                    outputMode: generator.outputMode.type,
                                    config: generator.config
                                };
                            });
                        })
                };
            })
        }
    });

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const absolutePathToPreview = preview
                    ? join(workspace.absoluteFilePath, RelativeFilePath.of(PREVIEW_DIRECTORY))
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
                    groupName,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker,
                    absolutePathToPreview,
                    mode
                });
            });
        })
    );
}
