import { LogLevel } from "@fern-api/logger";
import { Workspace } from "@fern-api/workspace-loader";
import { FernFiddle, FernFiddleClient } from "@fern-fern/fiddle-sdk";
import { CliContext } from "../../cli-context/CliContext";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";

export async function registerWorkspace({
    workspace,
    cliContext,
    token,
    version,
}: {
    workspace: Workspace;
    cliContext: CliContext;
    token: string;
    version: string | undefined;
}): Promise<void> {
    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        await validateWorkspaceAndLogIssues(workspace, context);
        const fiddle = new FernFiddleClient({
            environment: FIDDLE_ORIGIN,
            token,
        });
        const registerApiResponse = await fiddle.definitionRegistry.registerUsingOrgToken({
            apiId: FernFiddle.ApiId(workspace.rootApiFile.name),
            version,
            cliVersion: cliContext.environment.packageVersion,
        });
        if (!registerApiResponse.ok) {
            registerApiResponse.error._visit({
                versionAlreadyExists: () => {
                    context.failAndThrow(`Version ${version ?? ""} is already registered`);
                },
                _other: (value) => {
                    const baseMessage = `Failed to register ${version ?? ""}`;
                    if (cliContext.getLogLevel() === LogLevel.Debug) {
                        context.failAndThrow(`${baseMessage}: ${JSON.stringify(value)}`);
                    }
                    context.failAndThrow(`${baseMessage}`);
                },
            });
            return;
        }
        context.logger.info(`Registered ${registerApiResponse.body.version}`);
    });
}
