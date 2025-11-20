import * as csharp from "./fixtures/custom-sections/csharp";
import * as go from "./fixtures/custom-sections/go";
import * as java from "./fixtures/custom-sections/java";
import * as php from "./fixtures/custom-sections/php";
import * as python from "./fixtures/custom-sections/python";
import * as ts from "./fixtures/custom-sections/typescript";
import { testGenerateReadme } from "./testGenerateReadme";

describe("typescript custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/typescript/no-custom-sections",
        config: ts.noCustomSectionsConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/basic",
        config: ts.basicConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/override-custom-section",
        config: ts.overrideCustomSectionConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/invalid-key",
        config: ts.invalidKeyConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/invalid-language",
        config: ts.invalidLanguageConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/multiple-custom-sections",
        config: ts.multipleCustomSectionsConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/custom-sections-with-advanced-features",
        config: ts.customSectionsWithAdvancedFeaturesConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/custom-sections-with-core-and-advanced-features",
        config: ts.customSectionsWithCoreAndAdvancedFeaturesConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/typescript/multiple-custom-sections-with-advanced-features",
        config: ts.multipleCustomSectionsWithAdvancedFeaturesConfig,
        originalReadme: "../../ts.README.md"
    });
});

describe("python custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/python/no-custom-sections",
        config: python.noCustomSectionsConfig,
        originalReadme: "../../py.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/python/basic",
        config: python.basicConfig,
        originalReadme: "../../py.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/python/override-custom-section",
        config: python.overrideCustomSectionConfig,
        originalReadme: "../../py.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/python/invalid-key",
        config: python.invalidKeyConfig,
        originalReadme: "../../py.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/python/invalid-language",
        config: python.invalidLanguageConfig,
        originalReadme: "../../py.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/python/multiple-custom-sections",
        config: python.multipleCustomSectionsConfig,
        originalReadme: "../../py.README.md"
    });
});

describe("java custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/java/no-custom-sections",
        config: java.noCustomSectionsConfig,
        originalReadme: "../../java.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/java/basic",
        config: java.basicConfig,
        originalReadme: "../../java.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/java/override-custom-section",
        config: java.overrideCustomSectionConfig,
        originalReadme: "../../java.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/java/invalid-key",
        config: java.invalidKeyConfig,
        originalReadme: "../../java.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/java/invalid-language",
        config: java.invalidLanguageConfig,
        originalReadme: "../../java.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/java/multiple-custom-sections",
        config: java.multipleCustomSectionsConfig,
        originalReadme: "../../java.README.md"
    });
});

describe("php custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/php/no-custom-sections",
        config: php.noCustomSectionsConfig,
        originalReadme: "../../php.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/php/basic",
        config: php.basicConfig,
        originalReadme: "../../php.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/php/override-custom-section",
        config: php.overrideCustomSectionConfig,
        originalReadme: "../../php.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/php/invalid-key",
        config: php.invalidKeyConfig,
        originalReadme: "../../php.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/php/invalid-language",
        config: php.invalidLanguageConfig,
        originalReadme: "../../php.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/php/multiple-custom-sections",
        config: php.multipleCustomSectionsConfig,
        originalReadme: "../../php.README.md"
    });
});

describe("csharp custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/csharp/no-custom-sections",
        config: csharp.noCustomSectionsConfig,
        originalReadme: "../../ts.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/csharp/basic",
        config: csharp.basicConfig,
        originalReadme: "../../csharp.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/csharp/override-custom-section",
        config: csharp.overrideCustomSectionConfig,
        originalReadme: "../../csharp.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/csharp/invalid-key",
        config: csharp.invalidKeyConfig,
        originalReadme: "../../csharp.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/csharp/invalid-language",
        config: csharp.invalidLanguageConfig,
        originalReadme: "../../csharp.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/csharp/multiple-custom-sections",
        config: csharp.multipleCustomSectionsConfig,
        originalReadme: "../../csharp.README.md"
    });
});

describe("go custom sections", () => {
    testGenerateReadme({
        fixtureName: "custom-sections/go/no-custom-sections",
        config: go.noCustomSectionsConfig,
        originalReadme: "../../go.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/go/basic",
        config: go.basicConfig,
        originalReadme: "../../go.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/go/override-custom-section",
        config: go.overrideCustomSectionConfig,
        originalReadme: "../../go.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/go/invalid-key",
        config: go.invalidKeyConfig,
        originalReadme: "../../go.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/go/invalid-language",
        config: go.invalidLanguageConfig,
        originalReadme: "../../go.README.md"
    });

    testGenerateReadme({
        fixtureName: "custom-sections/go/multiple-custom-sections",
        config: go.multipleCustomSectionsConfig,
        originalReadme: "../../go.README.md"
    });
});
