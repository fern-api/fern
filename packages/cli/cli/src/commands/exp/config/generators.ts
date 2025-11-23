import { generatorsYml } from "@fern-api/configuration-loader";
import { keys } from "@fern-api/core-utils";

import { loadSwiftGeneratorCLI } from "./generator-loaders/swift";
import { SdkGeneratorCLILoader } from "./types";

const SUPPORTED_LANG_MAP: Record<generatorsYml.GenerationLanguage, SdkGeneratorCLILoader | undefined> = {
    [generatorsYml.GenerationLanguage.SWIFT]: loadSwiftGeneratorCLI,
    [generatorsYml.GenerationLanguage.TYPESCRIPT]: undefined,
    [generatorsYml.GenerationLanguage.JAVA]: undefined,
    [generatorsYml.GenerationLanguage.PYTHON]: undefined,
    [generatorsYml.GenerationLanguage.GO]: undefined,
    [generatorsYml.GenerationLanguage.RUBY]: undefined,
    [generatorsYml.GenerationLanguage.CSHARP]: undefined,
    [generatorsYml.GenerationLanguage.PHP]: undefined,
    [generatorsYml.GenerationLanguage.RUST]: undefined
};

const SUPPORTED_LANGS = new Set(keys(SUPPORTED_LANG_MAP).filter((lang) => SUPPORTED_LANG_MAP[lang] != null));

export function isLanguageSupportedForLocalGeneration(lang: generatorsYml.GenerationLanguage) {
    return SUPPORTED_LANGS.has(lang);
}

export function getSdkGeneratorCLILoader(lang: generatorsYml.GenerationLanguage) {
    return SUPPORTED_LANG_MAP[lang];
}
