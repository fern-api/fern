import { describe, expect, it } from "vitest";

describe("getChangelogUrl", () => {
    function getChangelogUrl(generatorName: string): string | undefined {
        const changelogMap: Record<string, string> = {
            "fernapi/fern-typescript-sdk": "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
            "fernapi/fern-typescript-node-sdk":
                "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
            "fernapi/fern-python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
            "fernapi/fern-go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
            "fernapi/fern-java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
            "fernapi/fern-csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
            "fernapi/fern-php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
            "fernapi/fern-ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
            "fernapi/fern-swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
        };

        return changelogMap[generatorName];
    }

    it.each([
        {
            generatorName: "fernapi/fern-typescript-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        },
        {
            generatorName: "fernapi/fern-typescript-node-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        },
        {
            generatorName: "fernapi/fern-python-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/python/changelog"
        },
        {
            generatorName: "fernapi/fern-go-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/go/changelog"
        },
        {
            generatorName: "fernapi/fern-java-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/java/changelog"
        },
        {
            generatorName: "fernapi/fern-csharp-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/csharp/changelog"
        },
        {
            generatorName: "fernapi/fern-php-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/php/changelog"
        },
        {
            generatorName: "fernapi/fern-ruby-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/ruby/changelog"
        },
        {
            generatorName: "fernapi/fern-swift-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
        }
    ])("returns correct changelog URL for $generatorName", ({ generatorName, expected }) => {
        expect(getChangelogUrl(generatorName)).toBe(expected);
    });

    it.each([
        { generatorName: "fernapi/fern-postman" },
        { generatorName: "fernapi/fern-openapi" },
        { generatorName: "fernapi/fern-fastapi-server" },
        { generatorName: "fernapi/fern-typescript-express" },
        { generatorName: "fernapi/fern-java-spring" },
        { generatorName: "fernapi/fern-pydantic-model" },
        { generatorName: "fernapi/fern-rust-sdk" },
        { generatorName: "unknown-generator" }
    ])("returns undefined for generators without changelogs: $generatorName", ({ generatorName }) => {
        expect(getChangelogUrl(generatorName)).toBeUndefined();
    });
});
