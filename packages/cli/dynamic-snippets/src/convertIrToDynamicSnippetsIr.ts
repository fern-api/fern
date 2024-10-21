import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { DynamicSnippets } from "./generated";

export async function convertIrToDynamicSnippetsIr(
    ir: IntermediateRepresentation
): Promise<DynamicSnippets.DynamicIntermediateRepresentation> {
    return {
        types: {},
        endpoints: {},
        headers: []
    };
}
