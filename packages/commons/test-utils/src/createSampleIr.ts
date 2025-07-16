import { SourceResolverImpl } from "@fern-api/cli-source-resolver"
import { Audiences, generatorsYml } from "@fern-api/configuration"
import { AbsoluteFilePath } from "@fern-api/fs-utils"
import { generateIntermediateRepresentation } from "@fern-api/ir-generator"
import { TaskContext, createMockTaskContext } from "@fern-api/task-context"
import { loadAPIWorkspace } from "@fern-api/workspace-loader"

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api"

export interface CreateSampleIrOptions {
    workspaceName?: string
    context?: TaskContext
    cliVersion?: string
    generationLanguage?: generatorsYml.GenerationLanguage
    audiences?: Audiences
    keywords?: string[]
    smartCasing?: boolean
    exampleGeneration?: generateIntermediateRepresentation.Args["exampleGeneration"]
    readme?: generatorsYml.ReadmeSchema
    version?: string
    packageName?: string
}

/**
 * Loads the definition from the specified directory and creates a sample IR for testing purposes.
 */
export async function createSampleIr(
    absolutePathToWorkspace: string | AbsoluteFilePath,
    opts?: CreateSampleIrOptions
): Promise<IntermediateRepresentation> {
    const pathToWorkspace =
        typeof absolutePathToWorkspace === "string"
            ? AbsoluteFilePath.of(absolutePathToWorkspace)
            : absolutePathToWorkspace
    const workspaceName = opts?.workspaceName ?? "Test Workspace"
    const context = opts?.context ?? createMockTaskContext()
    const cliVersion = opts?.cliVersion ?? "0.0.0"

    const generationLanguage = opts?.generationLanguage
    const audiences = opts?.audiences ?? { type: "all" }
    const keywords = opts?.keywords
    const smartCasing = opts?.smartCasing ?? true
    const exampleGeneration = opts?.exampleGeneration ?? { disabled: true }
    const readme = opts?.readme
    const version = opts?.version
    const packageName = opts?.packageName

    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: pathToWorkspace,
        context,
        cliVersion,
        workspaceName
    })
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace '${pathToWorkspace}'`)
    }
    const fernWorkspace = await workspace.workspace.toFernWorkspace({ context })
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage,
        audiences,
        keywords,
        smartCasing,
        exampleGeneration,
        readme,
        version,
        packageName,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    })
}
