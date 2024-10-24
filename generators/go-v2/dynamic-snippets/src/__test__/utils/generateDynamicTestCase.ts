import { Audiences } from "@fern-api/configuration";
import { createMockTaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToDynamicSnippetsIr } from "@fern-api/dynamic-snippets";
import { IntermediateRepresentation, dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";

export type DynamicTestCase = {
    ir: IntermediateRepresentation;
    dynamic: DynamicSnippets.DynamicIntermediateRepresentation;
};

export async function generateDynamicTestCase({
    workspace,
    audiences
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    audiences: Audiences;
}): Promise<DynamicTestCase> {
    const context = createMockTaskContext();
    const fernWorkspace = await workspace.toFernWorkspace({
        context
    });
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences,
        keywords: undefined,
        smartCasing: true,
        disableExamples: false,
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context
    });
    return {
        ir: intermediateRepresentation,
        dynamic: await convertIrToDynamicSnippetsIr(intermediateRepresentation)
    };
}
