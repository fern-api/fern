import { FernGeneratorCli } from "../../../configuration/sdk";

const baseConfig: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.go({
        publishInfo: {
            owner: "imdb",
            repo: "imdb-go-sdk",
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
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section for the package {{ owner }}/{{ repo }}:{{ version }}"
        }
    ]
};

export const overrideCustomSectionConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Preexisting Custom Section",
            language: FernGeneratorCli.Language.Go,
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
            content: "This is a custom section for the package {{ owner }}/{{ repo }}:{{ version }}"
        }
    ]
};

export const invalidLanguageConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section for the package {{ owner }}/{{ repo }}:{{ version }}"
        }
    ]
};

export const multipleCustomSectionsConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section for the package {{ owner }}/{{ repo }}:{{ version }}"
        },
        {
            name: "Second Custom Section",
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section for the package {{ owner }}/{{ repo }}:{{ version }}"
        }
    ]
};

export const customSectionsWithAdvancedFeaturesConfig: FernGeneratorCli.ReadmeConfig = {
    ...baseConfig,
    customSections: [
        {
            name: "Custom Section",
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section that should appear before Advanced Features"
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
            language: FernGeneratorCli.Language.Go,
            content: "This is a custom section that should appear after core features but before Advanced Features"
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
            language: FernGeneratorCli.Language.Go,
            content: "First custom section"
        },
        {
            name: "Custom Section Two",
            language: FernGeneratorCli.Language.Go,
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
