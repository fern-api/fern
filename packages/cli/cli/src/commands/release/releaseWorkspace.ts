import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function releaseWorkspace({
    workspace,
    organization,
    cliContext,
    version,
}: {
    workspace: Workspace;
    organization: string;
    cliContext: CliContext;
    version: string;
}): Promise<void> {
    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        const intermediateRepresentation = await generateIrForWorkspace({ workspace, context });
        if (intermediateRepresentation === TASK_FAILURE) {
            return;
        }
        await runRemoteGenerationForWorkspace({
            workspace,
            intermediateRepresentation,
            organization,
            context,
            version,
            generatorConfigs: workspace.generatorsConfiguration.release.map((generator) => ({
                id: generator.name,
                version: generator.version,
                willDownloadFiles: false,
                customConfig: generator.config,
                outputs: {
                    npm:
                        generator.outputs.npm != null
                            ? {
                                  registryUrl: generator.outputs.npm.url ?? "https://registry.npmjs.org",
                                  packageName: generator.outputs.npm.packageName,
                                  token: generator.outputs.npm.token,
                              }
                            : undefined,
                    maven:
                        generator.outputs.maven != null
                            ? {
                                  registryUrl: generator.outputs.maven.url ?? "http://repo1.maven.org",
                                  username: generator.outputs.maven.username,
                                  password: generator.outputs.maven.password,
                                  coordinate: generator.outputs.maven.coordinate,
                              }
                            : undefined,
                },
            })),
            generatorInvocations: workspace.generatorsConfiguration.release,
        });
    });
}
