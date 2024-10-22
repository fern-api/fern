import { dynamic as DynamicSnippets, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter";

export async function convertIrToDynamicSnippetsIr(
    ir: IntermediateRepresentation
): Promise<DynamicSnippets.DynamicIntermediateRepresentation> {
    const converter = new DynamicSnippetsConverter(ir);
    return converter.convert();
}
