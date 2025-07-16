import { mkdir, writeFile } from "fs/promises"
import yaml from "js-yaml"

import { SourceResolverImpl } from "@fern-api/cli-source-resolver"
import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils"
import { generateIntermediateRepresentation } from "@fern-api/ir-generator"
import { Project } from "@fern-api/project-loader"

import { CliContext } from "../../cli-context/CliContext"
import { convertIrToOpenApi } from "./convertIrToOpenApi"

export async function generateOpenAPIForWorkspaces({
    project,
    cliContext,
    outputPath
}: {
    project: Project
    cliContext: CliContext
    outputPath: AbsoluteFilePath
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context })
                const ir = generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: { type: "all" },
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false,
                    exampleGeneration: { disabled: true },
                    readme: undefined,
                    version: undefined,
                    packageName: undefined,
                    context,
                    sourceResolver: new SourceResolverImpl(context, fernWorkspace)
                })
                const openapi = convertIrToOpenApi({
                    apiName: workspace.workspaceName ?? "api",
                    ir,
                    mode: "openapi"
                })

                await mkdir(dirname(outputPath), { recursive: true })
                await writeFile(
                    outputPath,
                    outputPath.endsWith(".json") ? JSON.stringify(openapi, undefined, 2) : yaml.dump(openapi)
                )
            })
        })
    )
}
