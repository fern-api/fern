import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

export async function getIrForApi(absolutePathToWorkspace: AbsoluteFilePath): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const response = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });
    if (!response.didSucceed) {
        return context.failAndThrow("Failed to load workspace", response.failures);
    }
    const fernWorkspace = await response.workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences: { type: "all" },
        keywords: undefined,
        smartCasing: true, // Verify the special casing convention in tests.
        disableExamples: false,
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
}
