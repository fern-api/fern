import chalk from "chalk";
import { writeFile } from "fs/promises";

import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function writeDocsDefinitionForProject({
    project,
    outputPath,
    cliContext
}: {
    project: Project;
    outputPath: string;
    cliContext: CliContext;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        return;
    }

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        const fernWorkspaces = await Promise.all(
            project.apiWorkspaces.map(async (workspace) => {
                return workspace.toFernWorkspace(
                    { context },
                    { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false }
                );
            })
        );

        const docsResolver = new DocsDefinitionResolver(
            docsWorkspace.config.instances[0]?.url ?? "http://localhost:8080",
            docsWorkspace,
            fernWorkspaces,
            context
        );
        const docsDefinition = await docsResolver.resolve();

        // Write the docs definition to the specified output path
        await writeFile(AbsoluteFilePath.of(outputPath), JSON.stringify(docsDefinition, null, 2));

        context.logger.info(chalk.green(`Docs definition written to ${outputPath}`));
    });
}
