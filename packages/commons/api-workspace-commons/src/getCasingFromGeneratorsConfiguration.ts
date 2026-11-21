import { generatorsYml } from "@fern-api/configuration";

export interface GeneratorCasingSettings {
    smartCasing: boolean;
    smartCasingDigitWordBoundary: boolean | undefined;
    /** The generators.yml generator the settings were read from. */
    generatorName: string;
}

/**
 * Reads the casing settings (`smart-casing`, `smart-casing-digit-word-boundary`) of the
 * generators.yml generator for a language, so that commands which build an IR for a language
 * without running a generator (e.g. `fern ir --language go`) case names the way that language's
 * SDK does. Prefers a generator with `smart-casing: true`; returns undefined when generators.yml
 * has no generator for the language.
 */
export function getCasingFromGeneratorsConfiguration({
    generatorsConfiguration,
    generationLanguage
}: {
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
}): GeneratorCasingSettings | undefined {
    if (generatorsConfiguration == null || generationLanguage == null) {
        return undefined;
    }
    const candidates = generatorsConfiguration.groups
        .flatMap((group) => group.generators)
        .filter((generatorInvocation) => generatorInvocation.language === generationLanguage);
    const generatorInvocation = candidates.find((candidate) => candidate.smartCasing) ?? candidates[0];
    if (generatorInvocation == null) {
        return undefined;
    }
    return {
        smartCasing: generatorInvocation.smartCasing,
        smartCasingDigitWordBoundary: generatorInvocation.smartCasingDigitWordBoundary,
        generatorName: generatorInvocation.name
    };
}
