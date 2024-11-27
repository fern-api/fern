import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { getAllOpenAPISpecs, LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
// TODO: clean up imports
import { OpenApiDocumentConverterNode } from "@fern-api/docs-parsers";
import { ErrorCollector } from "@fern-api/docs-parsers";
import fs from "fs";
import yaml from "js-yaml";
import { BaseOpenApiV3_1ConverterNodeContext } from "@fern-api/docs-parsers";
import { OpenAPIV3_1 } from "openapi-types";

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
                    const openAPISpecs = await getAllOpenAPISpecs({ context, specs: workspace.specs });

                    const openApi = openAPISpecs[0];

                    if (openApi != null) {
                        const input = yaml.load(
                            fs.readFileSync(openApi.absoluteFilepath, "utf8")
                        ) as OpenAPIV3_1.Document;

                        const oasContext: BaseOpenApiV3_1ConverterNodeContext = {
                            document: input,
                            logger: context.logger,
                            errors: new ErrorCollector()
                        };

                        const openApiFdrJson = new OpenApiDocumentConverterNode({
                            input,
                            context: oasContext,
                            accessPath: [],
                            pathId: workspace.workspaceName ?? "openapi parser"
                        });

                        const fdrApiDefinition = await openApiFdrJson.convert();

                        const resolvedOutputFilePath = path.resolve(outputFilepath);
                        await writeFile(
                            resolvedOutputFilePath,
                            await stringifyLargeObject(fdrApiDefinition, { pretty: true })
                        );
                        context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`);
                    } else {
                        context.logger.error("No OpenAPI spec found in the workspace");
                    }
                });
            });
        })
    );
}
