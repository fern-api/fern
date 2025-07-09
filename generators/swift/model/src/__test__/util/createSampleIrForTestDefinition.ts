import { resolve } from "node:path";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

/**
 * Loads the definition from the parent `test-definitions` directory and creates a sample IR for testing purposes.
 */
export async function createSampleIrForTestDefinition(testDefinitionName: string): Promise<IntermediateRepresentation> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(resolve(__dirname, "../test-definitions", testDefinitionName));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName: testDefinitionName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace '${absolutePathToWorkspace}'`);
    }
    const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences: { type: "all" },
        keywords: undefined,
        smartCasing: true,
        exampleGeneration: { disabled: true },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
}
