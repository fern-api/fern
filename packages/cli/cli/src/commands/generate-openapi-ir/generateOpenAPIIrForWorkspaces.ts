import { writeFile } from "fs/promises";
import path from "path";

import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace, OpenAPILoader, getAllOpenAPISpecs } from "@fern-api/lazy-fern-workspace";
import { serialization } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { Project } from "@fern-api/project-loader";

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
                } else if (!(workspace instanceof OSSWorkspace)) {
                    return;
                }
                const openAPILoader = new OpenAPILoader(workspace.absoluteFilePath);
                const openAPISpecs = await getAllOpenAPISpecs({ context, specs: workspace.specs });
                const openAPIIr = parse({
                    context,
                    documents: await openAPILoader.loadDocuments({ context, specs: openAPISpecs })
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
