import { Audiences } from "@fern-api/config-management-commons";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function generateIrForFernWorkspace({
    workspace,
    context,
    generationLanguage,
    disableExamples,
    audiences
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: GenerationLanguage | undefined;
    disableExamples: boolean;
    audiences: Audiences;
}): Promise<IntermediateRepresentation> {
    await validateAPIWorkspaceAndLogIssues({ workspace, context, logWarnings: false });
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
        disableExamples,
        audiences
    });
}
