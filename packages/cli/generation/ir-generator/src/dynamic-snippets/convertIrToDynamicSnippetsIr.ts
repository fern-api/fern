import { dynamic as DynamicSnippets, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter";
import { generatorsYml } from "@fern-api/configuration";

export function convertIrToDynamicSnippetsIr({
    ir,
    generationLanguage,
    smartCasing,
    includeExamples
}: {
    ir: IntermediateRepresentation;
    generationLanguage?: generatorsYml.GenerationLanguage;
    smartCasing?: boolean;
    includeExamples?: boolean;
}): DynamicSnippets.DynamicIntermediateRepresentation {
    const converter = new DynamicSnippetsConverter({ ir, generationLanguage, smartCasing });
    return converter.convert({ includeExamples });
}
