import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { getOpenAPIIRFromOpenAPIWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";

export async function generateOpenAPIIrForWorkspaces({
    project,
    irFilepath,
    cliContext
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "fern") {
                    context.logger.info("Skipping, API is specified as a Fern Definition.");
                    return;
                }

                const openAPIIr = getOpenAPIIRFromOpenAPIWorkspace(workspace, context);

                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, await stringifyLargeObject(openAPIIr, { pretty: true }));
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}
