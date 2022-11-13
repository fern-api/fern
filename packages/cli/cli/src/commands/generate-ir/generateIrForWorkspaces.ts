import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Language } from "@fern-api/ir-generator";
import { Project } from "@fern-api/project-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForWorkspace } from "./generateIrForWorkspace";

export async function generateIrForWorkspaces({
    project,
    irFilepath,
    cliContext,
    generationLanguage,
    audiences,
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    generationLanguage: Language | undefined;
    audiences: string[];
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const intermediateRepresentation = await generateIrForWorkspace({
                    workspace,
                    context,
                    generationLanguage,
                    audiences,
                });
                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, JSON.stringify(intermediateRepresentation, undefined, 4));
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}
