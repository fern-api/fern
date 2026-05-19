import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { collectRawSpecs, SPECS_MANIFEST_FILENAME } from "@fern-api/local-workspace-runner";
import { Project } from "@fern-api/project-loader";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { CliContext } from "../../cli-context/CliContext.js";

export async function resolveSpecsForWorkspaces({
    project,
    outputDir,
    cliContext
}: {
    project: Project;
    outputDir: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (!(workspace instanceof OSSWorkspace)) {
                    context.logger.info("Skipping, API is specified as a Fern Definition.");
                    return;
                }

                const specs = workspace.allSpecs;
                if (specs.length === 0) {
                    context.logger.info("No specs found.");
                    return;
                }

                const workspaceOutputDir =
                    project.apiWorkspaces.length > 1
                        ? AbsoluteFilePath.of(path.join(outputDir, workspace.workspaceName ?? "api"))
                        : outputDir;

                await mkdir(workspaceOutputDir, { recursive: true });

                const manifest = await collectRawSpecs({
                    specs,
                    hostOutputDir: workspaceOutputDir,
                    containerBaseDir: ".",
                    context
                });

                await writeFile(
                    path.join(workspaceOutputDir, SPECS_MANIFEST_FILENAME),
                    JSON.stringify(manifest, undefined, 4)
                );

                context.logger.info(`Resolved ${manifest.specs.length} spec(s) to ${workspaceOutputDir}`);
            });
        })
    );
}
