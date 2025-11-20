import { FernGeneratorCli } from "../../../configuration/sdk";

const baseConfig: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.csharp({
        publishInfo: {
            packageName: "imdb/imdb-csharp-sdk"
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
            language: FernGeneratorCli.Language.Csharp,
            content: "This is a custom section for the package {{ packageName }}"
        }
    ]
};

export const overrideCustomSectionConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Preexisting Custom Section",
            language: FernGeneratorCli.Language.Csharp,
            content: "This will overwrite the preexisting custom section"
        }
    ]
};

export const invalidKeyConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Csharp,
            content: "This is a custom section for the package {{ version }}"
        }
    ]
};

export const invalidLanguageConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a custom section for the package {{ packageName }}"
        }
    ]
};

export const multipleCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Csharp,
            content: "This is a custom section for the package {{ packageName }}"
        },
        {
            name: "Second Custom Section",
            language: FernGeneratorCli.Language.Csharp,
            content: "This is another custom section for the package {{ packageName }}"
        }
    ]
};
