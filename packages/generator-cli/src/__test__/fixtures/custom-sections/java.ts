import { FernGeneratorCli } from "../../../configuration/generated";

const baseConfig: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.java({
        publishInfo: {
            artifact: "imdb-java-sdk",
            group: "imdb",
            version: "2.0.0"
        }
    }),
    apiName: "IMDB Inc",
    organization: "imdb"
};

export const noCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig
};

export const basicConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a custom section for the package {{ group }}/{{ artifact }}:{{ version }}"
        }
    ]
};

export const overrideCustomSectionConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Preexisting Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This will overwrite the preexisting custom section"
        }
    ]
};

export const invalidKeyConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a custom section for the package {{ packageName }}"
        }
    ]
};

export const invalidLanguageConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a custom section for the package {{ group }}/{{ artifact }}:{{ version }}"
        }
    ]
};

export const multipleCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a custom section for the package {{ group }}/{{ artifact }}:{{ version }}"
        },
        {
            name: "Second Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a custom section for the package {{ group }}/{{ artifact }}:{{ version }}"
        }
    ]
};
