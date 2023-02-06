import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateFernWorkspace } from "./generateFernWorkspace";

export async function generateWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
}): Promise<void> {
    const token = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token.type === "user") {
        await cliContext.runTask(async (context) => {
            await createOrganizationIfDoesNotExist({
                organization: project.config.organization,
                token,
                context,
            });
        });
    }

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate",
        properties: {
            workspaces: project.workspaces.map((workspace) => {
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
                                    config: generator.config,
                                };
                            });
                        }),
                };
            }),
        },
    });

    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    context.failWithoutThrowing("Generating from OpenAPI not currently supported.");
                    return;
                }
                await generateFernWorkspace({
                    workspace,
                    organization: project.config.organization,
                    context,
                    version,
                    groupName,
                    shouldLogS3Url,
                    token,
                });
            });
        })
    );
}
