import chalk from "chalk";

import { FernToken } from "@fern-api/auth";
import { Project } from "@fern-api/project-loader";
import { registerApi } from "@fern-api/register";

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
                        goSdk: undefined
                    }
                });
                context.logger.info(chalk.green("Registered API"));
            });
        })
    );
}
