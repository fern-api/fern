import { FernToken } from "@fern-api/auth";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";
import { AIExampleEnhancerConfig, registerApi } from "@fern-api/register";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext.js";

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
                // Get GraphQL data from workspace (now processed during workspace loading)
                const graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> =
                    workspace instanceof OSSWorkspace ? workspace.getGraphqlOperations() : {};
                const graphqlTypes: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> =
                    workspace instanceof OSSWorkspace ? workspace.getGraphqlTypes() : {};

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
