import { Audiences } from "@fern-api/config-management-commons";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { validateFernWorkspaceAndLogIssues } from "../validate/validateFernWorkspaceAndLogIssues";

export async function generateIrForFernWorkspace({
    workspace,
    context,
    generationLanguage,
    audiences,
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: GenerationLanguage | undefined;
    audiences: Audiences;
}): Promise<IntermediateRepresentation> {
    await validateFernWorkspaceAndLogIssues(workspace, context);
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
        audiences,
    });
}
