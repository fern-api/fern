import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { PREVIEW_DIRECTORY } from "../../constants";
import { generateWorkspace } from "./generateAPIWorkspace";

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
}): Promise<void> {
    const token = await cliContext.runTask(async (context) => {
        return askToLogin(context);
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

    cliContext.instrumentPostHogEvent({
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
                    ? join(workspace.absoluteFilepath, RelativeFilePath.of(PREVIEW_DIRECTORY))
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
                    absolutePathToPreview
                });
            });
        })
    );
}
