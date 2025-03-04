import { generatorsYml } from "@fern-api/configuration";
import { IntermediateRepresentation, dynamic } from "@fern-api/ir-sdk";

import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter";

export function convertIrToDynamicSnippetsIr({
    ir,
    generationLanguage,
    smartCasing,
    includeExamples,
    generatorConfig
}: {
    ir: IntermediateRepresentation;
    generationLanguage?: generatorsYml.GenerationLanguage;
    smartCasing?: boolean;
    includeExamples?: boolean;
    generatorConfig?: dynamic.GeneratorConfig;
}): dynamic.DynamicIntermediateRepresentation {
    const converter = new DynamicSnippetsConverter({ ir, generationLanguage, smartCasing, generatorConfig });
    return converter.convert({ includeExamples });
}
