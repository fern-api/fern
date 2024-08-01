import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { serialization } from "@fern-api/openapi-ir-sdk";
import { parse } from "@fern-api/openapi-parser";
import { Project } from "@fern-api/project-loader";
import { LazyFernWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";

export async function generateOpenAPIIrForWorkspaces({
    project,
    irFilepath,
    cliContext,
    sdkLanguage
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace instanceof LazyFernWorkspace) {
                    context.logger.info("Skipping, API is specified as a Fern Definition.");
                    return;
                }
                const openAPIIr = await parse({
                    specs: workspace.specs,
                    taskContext: context
                });

                const irOutputFilePath = path.resolve(irFilepath);
                const openApiIrJson = await serialization.OpenApiIntermediateRepresentation.jsonOrThrow(openAPIIr, {
                    skipValidation: true
                });
                await writeFile(irOutputFilePath, await stringifyLargeObject(openApiIrJson, { pretty: true }));
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}
