import path from "path"

import { Audiences } from "@fern-api/configuration-loader"
import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils"
import { Project } from "@fern-api/project-loader"
import { convertIrToFdrApi } from "@fern-api/register"

import { CliContext } from "../../cli-context/CliContext"
import { generateIrForFernWorkspace } from "../generate-ir/generateIrForFernWorkspace"

export async function generateFdrApiDefinitionForWorkspaces({
    project,
    outputFilepath,
    cliContext,
    audiences
}: {
    project: Project
    outputFilepath: AbsoluteFilePath
    cliContext: CliContext
    audiences: Audiences
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context })
                const ir = await generateIrForFernWorkspace({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage: undefined,
                    audiences,
                    keywords: undefined,
                    smartCasing: false,
                    disableExamples: false,
                    readme: undefined,
                    disableDynamicExamples: true
                })

                const apiDefinition = convertIrToFdrApi({
                    ir,
                    snippetsConfig: {
                        typescriptSdk: undefined,
                        pythonSdk: undefined,
                        javaSdk: undefined,
                        rubySdk: undefined,
                        goSdk: undefined,
                        csharpSdk: undefined
                    }
                })

                const resolvedOutputFilePath = AbsoluteFilePath.of(path.resolve(outputFilepath))
                await streamObjectToFile(resolvedOutputFilePath, apiDefinition, { pretty: true })
                context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`)
            })
        })
    )
}
