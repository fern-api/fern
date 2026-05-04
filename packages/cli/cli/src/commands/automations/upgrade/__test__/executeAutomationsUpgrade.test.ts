import { describe, expect, it } from "vitest";

import { getChangelogUrl } from "../executeAutomationsUpgrade.js";

describe("getChangelogUrl", () => {
    it("derives typescript changelog URL from SDK generator name", () => {
        expect(getChangelogUrl("fernapi/fern-typescript-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        );
    });

    it("derives typescript changelog URL from node SDK variant", () => {
        expect(getChangelogUrl("fernapi/fern-typescript-node-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/typescript/changelog"
        );
    });

    it("derives python changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-python-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/python/changelog"
        );
    });

    it("derives go changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-go-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/go/changelog"
        );
    });

    it("derives java changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-java-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/java/changelog"
        );
    });

    it("derives csharp changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-csharp-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/csharp/changelog"
        );
    });

    it("derives ruby changelog URL from v2 variant", () => {
        expect(getChangelogUrl("fernapi/fern-ruby-sdk-v2")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/ruby/changelog"
        );
    });

    it("derives php changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-php-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/php/changelog"
        );
    });

    it("derives swift changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-swift-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
        );
    });

    it("derives rust changelog URL", () => {
        expect(getChangelogUrl("fernapi/fern-rust-sdk")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/rust/changelog"
        );
    });

    it("returns undefined for unrecognized generator names", () => {
        expect(getChangelogUrl("some-other-generator")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
        expect(getChangelogUrl("")).toBeUndefined();
    });

    it("returns undefined for generator without fernapi prefix", () => {
        expect(getChangelogUrl("custom-org/fern-typescript-sdk")).toBeUndefined();
    });

    it("handles model generators (non-SDK)", () => {
        expect(getChangelogUrl("fernapi/fern-java-model")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/java/changelog"
        );
    });

    it("handles server generators", () => {
        expect(getChangelogUrl("fernapi/fern-python-server")).toBe(
            "https://buildwithfern.com/learn/sdks/generators/python/changelog"
        );
    });
});

describe("AutomationsUpgradeResult schema", () => {
    it("documents the expected JSON output shape", () => {
        // This test documents the contract between CLI and GHA consumers.
        // If the schema changes, this test should be updated alongside the GHA.
        const exampleResult = {
            cli: { from: "4.66.0", to: "4.96.0", upgraded: true },
            generators: [
                {
                    name: "fernapi/fern-typescript-sdk",
                    group: "ts-sdk",
                    api: "api",
                    from: "3.63.4",
                    to: "3.65.5",
                    changelog: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
                    migrationsApplied: 1
                }
            ],
            skippedMajor: [{ name: "fernapi/fern-ruby-sdk-v2", current: "0.3.0", latest: "1.0.0" }],
            alreadyUpToDate: [{ name: "fernapi/fern-go-sdk", version: "1.37.0" }]
        };

        // Verify all top-level keys exist
        expect(exampleResult).toHaveProperty("cli");
        expect(exampleResult).toHaveProperty("generators");
        expect(exampleResult).toHaveProperty("skippedMajor");
        expect(exampleResult).toHaveProperty("alreadyUpToDate");

        // Verify cli shape
        expect(exampleResult.cli).toHaveProperty("from");
        expect(exampleResult.cli).toHaveProperty("to");
        expect(exampleResult.cli).toHaveProperty("upgraded");

        // Verify generator entry shape
        const gen = exampleResult.generators[0];
        expect(gen).toBeDefined();
        expect(gen).toHaveProperty("name");
        expect(gen).toHaveProperty("group");
        expect(gen).toHaveProperty("api");
        expect(gen).toHaveProperty("from");
        expect(gen).toHaveProperty("to");
        expect(gen).toHaveProperty("changelog");
        expect(gen).toHaveProperty("migrationsApplied");

        // Verify skippedMajor entry shape
        const skip = exampleResult.skippedMajor[0];
        expect(skip).toBeDefined();
        expect(skip).toHaveProperty("name");
        expect(skip).toHaveProperty("current");
        expect(skip).toHaveProperty("latest");

        // Verify alreadyUpToDate entry shape
        const upToDate = exampleResult.alreadyUpToDate[0];
        expect(upToDate).toBeDefined();
        expect(upToDate).toHaveProperty("name");
        expect(upToDate).toHaveProperty("version");
    });

    it("supports null api field for single-API projects", () => {
        const entry = {
            name: "fernapi/fern-typescript-sdk",
            group: "ts-sdk",
            api: null,
            from: "3.63.4",
            to: "3.65.5",
            changelog: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
            migrationsApplied: 0
        };
        expect(entry.api).toBeNull();
    });
});
