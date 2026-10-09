import { generatorsYml } from "@fern-api/configuration";
import { dynamic, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter.js";

export function convertIrToDynamicSnippetsIr({
    ir,
    generationLanguage,
    smartCasing,
    smartCasingDigitWordBoundary,
    disableExamples,
    generatorConfig
}: {
    ir: IntermediateRepresentation;
    generationLanguage?: generatorsYml.GenerationLanguage;
    smartCasing?: boolean;
    smartCasingDigitWordBoundary?: boolean;
    disableExamples?: boolean;
    generatorConfig?: dynamic.GeneratorConfig;
}): dynamic.DynamicIntermediateRepresentation {
    const converter = new DynamicSnippetsConverter({
        ir,
        generationLanguage,
        smartCasing,
        smartCasingDigitWordBoundary,
        generatorConfig
    });
    return converter.convert({ disableExamples });
}
