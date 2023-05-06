import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse } from "@fern-api/openapi-parser";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, OpenAPIWorkspace } from "@fern-api/workspace-loader";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { CliContext } from "../../cli-context/CliContext";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
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
                    keepDocker,
                });
            });
        })
    );
}

export async function convertOpenApiWorkspaceToFernWorkspace(
    openapiWorkspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<FernWorkspace> {
    const openApiIr = await parse({
        root: openapiWorkspace.definition,
        taskContext: context,
    });
    const definition = convert({
        openApiIr,
    });

    return {
        type: "fern",
        name: openapiWorkspace.name,
        generatorsConfiguration: openapiWorkspace.generatorsConfiguration,
        docsDefinition: openapiWorkspace.docsDefinition,
        absoluteFilepath: openapiWorkspace.absoluteFilepath,
        dependenciesConfiguration: {
            dependencies: {},
        },
        definition: {
            // these files doesn't live on disk, so there's no absolute filepath
            absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile),
            },
            namedDefinitionFiles: mapValues(definition.definitionFiles, (definitionFile) => ({
                // these files doesn't live on disk, so there's no absolute filepath
                absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                rawContents: yaml.dump(definitionFile),
                contents: definitionFile,
            })),
            packageMarkers: {},
            importedDefinitions: {},
        },
    };
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
