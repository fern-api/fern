import { FernToken } from "@fern-api/auth";
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
                    aiEnhancerConfig
                });
                context.logger.info(chalk.green("Registered API"));
            });
        })
    );
}

function getAIEnhancerConfig(): AIExampleEnhancerConfig | undefined {
    const fernAiEnhanceEnabled = process.env.FERN_AI_ENHANCE_EXAMPLES;

    if (fernAiEnhanceEnabled === "false") {
        return undefined;
    }

    return {
        enabled: true,
        model: process.env.FERN_AI_MODEL || "gpt-4o-mini",
        maxRetries: parseInt(process.env.FERN_AI_MAX_RETRIES || "3"),
        requestTimeoutMs: parseInt(process.env.FERN_AI_TIMEOUT_MS || "25000")
    };
}
