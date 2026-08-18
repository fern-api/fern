import { generatorsYml } from "@fern-api/configuration";
import { dynamic, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { DynamicSnippetsConverter } from "./DynamicSnippetsConverter.js";

export function convertIrToDynamicSnippetsIr({
    ir,
    generationLanguage,
    smartCasing,
    smartCasingDigitWordBoundary,
    additionalAcronyms,
    disableExamples,
    generatorConfig
}: {
    ir: IntermediateRepresentation;
    generationLanguage?: generatorsYml.GenerationLanguage;
    smartCasing?: boolean;
    smartCasingDigitWordBoundary?: boolean;
    additionalAcronyms?: string[];
    disableExamples?: boolean;
    generatorConfig?: dynamic.GeneratorConfig;
}): dynamic.DynamicIntermediateRepresentation {
    const converter = new DynamicSnippetsConverter({
        ir,
        generationLanguage,
        smartCasing,
        smartCasingDigitWordBoundary,
        additionalAcronyms,
        generatorConfig
    });
    return converter.convert({ disableExamples });
}
