import { generateIntermediateRepresentation, Language } from "@fern-api/ir-generator";
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
    generationLanguage: Language | undefined;
    audiences: string[] | undefined;
}): Promise<IntermediateRepresentation> {
    await validateFernWorkspaceAndLogIssues(workspace, context);
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
        audiences,
    });
}
