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
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const fernAiEnhanceEnabled = process.env.FERN_AI_ENHANCE_EXAMPLES;

    // Only enable if both the API key is present and enhancement is explicitly enabled
    if (!openaiApiKey || fernAiEnhanceEnabled !== "true") {
        return undefined;
    }

    return {
        enabled: true,
        openaiApiKey,
        model: process.env.FERN_AI_MODEL || "gpt-4",
        maxRetries: parseInt(process.env.FERN_AI_MAX_RETRIES || "3"),
        requestTimeoutMs: parseInt(process.env.FERN_AI_TIMEOUT_MS || "30000")
    };
}
