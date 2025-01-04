import { writeFile } from "fs/promises";
import { merge } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";
import path from "path";

// TODO: clean up imports
import { OpenApiDocumentConverterNode } from "@fern-api/docs-parsers";
import { ErrorCollector } from "@fern-api/docs-parsers";
import { BaseOpenApiV3_1ConverterNodeContext } from "@fern-api/docs-parsers";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace, OpenAPILoader, getAllOpenAPISpecs } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function generateOpenApiToFdrApiDefinitionForWorkspaces({
    project,
    outputFilepath,
    cliContext
}: {
    project: Project;
    outputFilepath: AbsoluteFilePath;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                await cliContext.runTaskForWorkspace(workspace, async (context) => {
                    if (workspace instanceof LazyFernWorkspace) {
                        context.logger.info("Skipping, API is specified as a Fern Definition.");
                        return;
                    } else if (!(workspace instanceof OSSWorkspace)) {
                        return;
                    }

                    const openApiLoader = new OpenAPILoader(workspace.absoluteFilePath);
                    const openApiSpecs = await getAllOpenAPISpecs({ context, specs: workspace.specs });

                    const openApiDocuments = await openApiLoader.loadDocuments({ context, specs: openApiSpecs });

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let fdrApiDefinition: any;
                    for (const openApi of openApiDocuments) {
                        if (openApi.type !== "openapi") {
                            continue;
                        }

                        const oasContext: BaseOpenApiV3_1ConverterNodeContext = {
                            document: openApi.value as OpenAPIV3_1.Document,
                            logger: context.logger,
                            errors: new ErrorCollector()
                        };

                        const openApiFdrJson = new OpenApiDocumentConverterNode({
                            input: openApi.value as OpenAPIV3_1.Document,
                            context: oasContext,
                            accessPath: [],
                            pathId: workspace.workspaceName ?? "openapi parser"
                        });

                        fdrApiDefinition = merge(fdrApiDefinition, openApiFdrJson.convert());
                    }

                    const resolvedOutputFilePath = path.resolve(outputFilepath);
                    await writeFile(
                        resolvedOutputFilePath,
                        await stringifyLargeObject(fdrApiDefinition, { pretty: true })
                    );
                    context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`);
                });
            });
        })
    );
}
