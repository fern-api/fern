import { FernGeneratorCli } from "../../../configuration/sdk";

const baseConfig: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "imdb/imdb-typescript-sdk"
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
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a customer section for the package {{ packageName }}"
        }
    ]
};

export const overrideCustomSectionConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Preexisting Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This will overwrite the preexisting custom section"
        }
    ]
};

export const invalidKeyConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a customer section for the package {{ version }}"
        }
    ]
};

export const invalidLanguageConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Java,
            content: "This is a customer section for the package {{ packageName }}"
        }
    ]
};

export const multipleCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a customer section for the package {{ packageName }}"
        },
        {
            name: "Second Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is another customer section for the package {{ packageName }}"
        }
    ]
};

export const customSectionsWithAdvancedFeaturesConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a custom section that should appear before Advanced"
        }
    ],
    features: [
        {
            id: "RETRIES",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature (retries)"
        },
        {
            id: "TIMEOUTS",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature (timeouts)"
        }
    ]
};

export const customSectionsWithCoreAndAdvancedFeaturesConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Typescript,
            content: "This is a custom section that should appear after core features but before Advanced"
        }
    ],
    features: [
        {
            id: "USAGE",
            snippetsAreOptional: true,
            addendum: "This is a core feature"
        },
        {
            id: "RETRIES",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature (retries)"
        },
        {
            id: "TIMEOUTS",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature (timeouts)"
        }
    ]
};

export const multipleCustomSectionsWithAdvancedFeaturesConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section One",
            language: FernGeneratorCli.Language.Typescript,
            content: "First custom section"
        },
        {
            name: "Custom Section Two",
            language: FernGeneratorCli.Language.Typescript,
            content: "Second custom section"
        }
    ],
    features: [
        {
            id: "USAGE",
            snippetsAreOptional: true,
            addendum: "This is a core feature"
        },
        {
            id: "RETRIES",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature (retries)"
        }
    ]
};
