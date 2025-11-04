import { FernGeneratorCli } from "../../../configuration/generated";

const baseConfig: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.python({
        publishInfo: {
            packageName: "imdb/imdb-python-sdk"
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
            language: FernGeneratorCli.Language.Python,
            content: "This is a custom section for the package {{ packageName }}"
        }
    ]
};

export const overrideCustomSectionConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Preexisting Custom Section",
            language: FernGeneratorCli.Language.Python,
            content: "This will overwrite the preexisting custom section"
        }
    ]
};

export const invalidKeyConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Python,
            content: "This is a custom section for the package {{ version }}"
        }
    ]
};

export const invalidLanguageConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a custom section for the package {{ packageName }}"
        }
    ]
};

export const multipleCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Python,
            content: "This is a custom section for the package {{ packageName }}"
        },
        {
            name: "Second Custom Section",
            language: FernGeneratorCli.Language.Python,
            content: "This is another custom section for the package {{ packageName }}"
        }
    ]
};
