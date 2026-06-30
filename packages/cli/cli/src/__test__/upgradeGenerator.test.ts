import { describe, expect, it } from "vitest";

describe("getChangelogUrl", () => {
    function getChangelogUrl(generatorName: string): string | undefined {
        const changelogMap: Record<string, string> = {
            "fernenterprise/fern-typescript-sdk":
                "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
            "fernenterprise/fern-typescript-node-sdk":
                "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
            "fernenterprise/fern-python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
            "fernenterprise/fern-go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
            "fernenterprise/fern-java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
            "fernenterprise/fern-csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
            "fernenterprise/fern-php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
            "fernenterprise/fern-ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
            "fernenterprise/fern-swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
        };

        return changelogMap[generatorName];
    }

    it.each([
        {
            generatorName: "fernenterprise/fern-typescript-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        },
        {
            generatorName: "fernenterprise/fern-typescript-node-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        },
        {
            generatorName: "fernenterprise/fern-python-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/python/changelog"
        },
        {
            generatorName: "fernenterprise/fern-go-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/go/changelog"
        },
        {
            generatorName: "fernenterprise/fern-java-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/java/changelog"
        },
        {
            generatorName: "fernenterprise/fern-csharp-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/csharp/changelog"
        },
        {
            generatorName: "fernenterprise/fern-php-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/php/changelog"
        },
        {
            generatorName: "fernenterprise/fern-ruby-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/ruby/changelog"
        },
        {
            generatorName: "fernenterprise/fern-swift-sdk",
            expected: "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
        }
    ])("returns correct changelog URL for $generatorName", ({ generatorName, expected }) => {
        expect(getChangelogUrl(generatorName)).toBe(expected);
    });

    it.each([
        { generatorName: "fernenterprise/fern-postman" },
        { generatorName: "fernenterprise/fern-openapi" },
        { generatorName: "fernenterprise/fern-fastapi-server" },
        { generatorName: "fernenterprise/fern-typescript-express" },
        { generatorName: "fernenterprise/fern-java-spring" },
        { generatorName: "fernenterprise/fern-pydantic-model" },
        { generatorName: "fernenterprise/fern-rust-sdk" },
        { generatorName: "unknown-generator" }
    ])("returns undefined for generators without changelogs: $generatorName", ({ generatorName }) => {
        expect(getChangelogUrl(generatorName)).toBeUndefined();
    });
});
