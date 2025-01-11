import { dynamic as DynamicSnippets, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter";

export function convertIrToDynamicSnippetsIr(
    ir: IntermediateRepresentation
): DynamicSnippets.DynamicIntermediateRepresentation {
    const converter = new DynamicSnippetsConverter(ir);
    return converter.convert();
}
