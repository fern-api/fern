import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { convertOpenApiWorkspaceToFernWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateWorkspace } from "./generateAPIWorkspace";

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
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
                    name: workspace.name,
                    group: groupName,
                    generators: workspace.generatorsConfiguration.groups
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
                const fernWorkspace: FernWorkspace =
                    workspace.type === "fern"
                        ? workspace
                        : await convertOpenApiWorkspaceToFernWorkspace(workspace, context);

                await generateWorkspace({
                    workspace: fernWorkspace,
                    organization: project.config.organization,
                    context,
                    version,
                    groupName,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker
                });
            });
        })
    );
}
