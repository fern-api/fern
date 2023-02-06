import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { join } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { convertOpenApi } from "@fern-api/openapi-migrator";
import { Project } from "@fern-api/project-loader";
import { FernWorkspace } from "@fern-api/workspace-loader";
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
                const fernWorkspace: FernWorkspace =
                    workspace.type === "fern"
                        ? workspace
                        : {
                              type: "fern",
                              name: workspace.name,
                              generatorsConfiguration: workspace.generatorsConfiguration,
                              absolutePathToDefinition: workspace.absolutePathToDefinition,
                              absolutePathToWorkspace: workspace.absolutePathToDefinition,
                              dependenciesConfiguration: {
                                  dependencies: {},
                              },
                              definition: await convertOpenApi({
                                  openApiPath: join(workspace.absolutePathToDefinition, workspace.definition.path),
                                  taskContext: context,
                              }),
                          };
                await generateFernWorkspace({
                    workspace: fernWorkspace,
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
