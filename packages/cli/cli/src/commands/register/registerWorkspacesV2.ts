import { FernToken } from "@fern-api/auth";
import { GraphQLConverter, GraphQLConverterResult } from "@fern-api/graphql-to-fdr";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";
import { AIExampleEnhancerConfig, registerApi } from "@fern-api/register";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";

export async function registerWorkspacesV2({
    project,
    cliContext,
    token
}: {
    project: Project;
    cliContext: CliContext;
    token: FernToken;
}): Promise<void> {
    // Configure AI example enhancement from environment variables
    const aiEnhancerConfig = getAIEnhancerConfig();

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // Extract GraphQL operations from the workspace
                const graphqlOperations: GraphQLConverterResult["graphqlOperations"] = {};
                const graphqlTypes: GraphQLConverterResult["types"] = {};

                // Process GraphQL specs in the workspace
                if (workspace instanceof OSSWorkspace) {
                    const graphqlSpecs = workspace.allSpecs.filter((spec) => spec.type === "graphql");
                    context.logger.debug(`Found ${graphqlSpecs.length} GraphQL specs in workspace`);

                    for (const spec of graphqlSpecs) {
                        try {
                            context.logger.debug(`Processing GraphQL spec: ${spec.absoluteFilepath}`);
                            const converter = new GraphQLConverter({
                                context,
                                filePath: spec.absoluteFilepath
                            });
                            const graphqlResult = await converter.convert();
                            const operationCount = Object.keys(graphqlResult.graphqlOperations).length;
                            const typeCount = Object.keys(graphqlResult.types).length;
                            context.logger.debug(
                                `GraphQL spec ${spec.absoluteFilepath} converted successfully with ${operationCount} operations and ${typeCount} types`
                            );

                            // Merge the GraphQL operations and types from this spec
                            Object.assign(graphqlOperations, graphqlResult.graphqlOperations);

                            // Merge the GraphQL types from this spec
                            Object.assign(graphqlTypes, graphqlResult.types);
                        } catch (error) {
                            context.logger.error(
                                `Failed to process GraphQL spec ${spec.absoluteFilepath}:`,
                                String(error)
                            );
                            // Continue processing other specs
                        }
                    }
                }

                context.logger.debug(
                    `Total extracted: ${Object.keys(graphqlOperations).length} GraphQL operations, ${Object.keys(graphqlTypes).length} GraphQL types`
                );

                await registerApi({
                    organization: project.config.organization,
                    workspace: await workspace.toFernWorkspace({ context }),
                    context,
                    token,
                    audiences: { type: "all" },
                    snippetsConfig: {
                        typescriptSdk: undefined,
                        pythonSdk: undefined,
                        javaSdk: undefined,
                        rubySdk: undefined,
                        goSdk: undefined,
                        csharpSdk: undefined,
                        phpSdk: undefined,
                        swiftSdk: undefined,
                        rustSdk: undefined
                    },
                    graphqlOperations,
                    graphqlTypes,
                    aiEnhancerConfig
                });
                context.logger.info(chalk.green("Registered API"));
            });
        })
    );
}

function getAIEnhancerConfig(): AIExampleEnhancerConfig | undefined {
    return undefined;
}
