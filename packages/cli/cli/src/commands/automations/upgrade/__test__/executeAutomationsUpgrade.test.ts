import { describe, expect, it } from "vitest";

import {
    buildCommitMessage,
    buildPrBody,
    buildPrTitle,
    getChangelogUrl,
    getShortGeneratorName
} from "../executeAutomationsUpgrade.js";

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

describe("getShortGeneratorName", () => {
    it("strips fernapi/fern- prefix", () => {
        expect(getShortGeneratorName("fernapi/fern-typescript-sdk")).toBe("typescript-sdk");
    });

    it("strips prefix from variant names", () => {
        expect(getShortGeneratorName("fernapi/fern-ruby-sdk-v2")).toBe("ruby-sdk-v2");
    });

    it("leaves non-fernapi names unchanged", () => {
        expect(getShortGeneratorName("custom-org/my-generator")).toBe("custom-org/my-generator");
    });
});

const CLI_UPGRADED = { from: "4.66.0", to: "5.7.3", upgraded: true };
const CLI_NOT_UPGRADED = { from: "5.7.3", to: "5.7.3", upgraded: false };

const GENERATOR_TS = {
    name: "fernapi/fern-typescript-sdk",
    group: "ts-sdk",
    api: "api" as string | null,
    from: "3.63.4",
    to: "3.65.5",
    changelog: "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
    migrationsApplied: 1
};

const GENERATOR_GO = {
    name: "fernapi/fern-go-sdk",
    group: "go-sdk",
    api: null as string | null,
    from: "0.28.0",
    to: "1.39.0",
    changelog: "https://buildwithfern.com/learn/sdks/generators/go/changelog",
    migrationsApplied: 0
};

describe("buildPrTitle", () => {
    it("includes CLI and generator count", () => {
        expect(buildPrTitle({ cli: CLI_UPGRADED, generators: [GENERATOR_TS, GENERATOR_GO] })).toBe(
            "chore(fern): upgrade CLI 4.66.0 → 5.7.3 and 2 generators"
        );
    });

    it("singular generator", () => {
        expect(buildPrTitle({ cli: CLI_NOT_UPGRADED, generators: [GENERATOR_TS] })).toBe(
            "chore(fern): upgrade 1 generator"
        );
    });

    it("CLI only", () => {
        expect(buildPrTitle({ cli: CLI_UPGRADED, generators: [] })).toBe("chore(fern): upgrade CLI 4.66.0 → 5.7.3");
    });
});

describe("buildPrBody", () => {
    it("includes CLI section and generator table", () => {
        const body = buildPrBody({ cli: CLI_UPGRADED, generators: [GENERATOR_TS] });
        expect(body).toContain("## Fern Upgrade");
        expect(body).toContain("### CLI");
        expect(body).toContain("`4.66.0` → `5.7.3`");
        expect(body).toContain("### Generators");
        expect(body).toContain("| fernapi/fern-typescript-sdk | 3.63.4 | 3.65.5 |");
        expect(body).toContain("[View](https://buildwithfern.com/learn/sdks/generators/typescript/changelog)");
        expect(body).toContain("fern-upgrade");
    });

    it("uses em-dash for missing changelog", () => {
        const gen = { ...GENERATOR_TS, changelog: undefined };
        const body = buildPrBody({ cli: CLI_NOT_UPGRADED, generators: [gen] });
        expect(body).toContain("| — |");
    });

    it("omits CLI section when not upgraded", () => {
        const body = buildPrBody({ cli: CLI_NOT_UPGRADED, generators: [GENERATOR_TS] });
        expect(body).not.toContain("### CLI");
    });

    it("omits generator section when no generators", () => {
        const body = buildPrBody({ cli: CLI_UPGRADED, generators: [] });
        expect(body).not.toContain("### Generators");
    });
});

describe("buildCommitMessage", () => {
    it("includes cli and short generator names", () => {
        expect(buildCommitMessage({ cli: CLI_UPGRADED, generators: [GENERATOR_TS] })).toBe(
            "chore: upgrade fern cli 4.66.0 -> 5.7.3, typescript-sdk 3.63.4 -> 3.65.5"
        );
    });

    it("generators only", () => {
        expect(buildCommitMessage({ cli: CLI_NOT_UPGRADED, generators: [GENERATOR_TS, GENERATOR_GO] })).toBe(
            "chore: upgrade fern typescript-sdk 3.63.4 -> 3.65.5, go-sdk 0.28.0 -> 1.39.0"
        );
    });
});

describe("AutomationsUpgradeResult schema", () => {
    it("documents the expected JSON output shape including pr field", () => {
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
            alreadyUpToDate: [{ name: "fernapi/fern-go-sdk", version: "1.37.0" }],
            pr: {
                title: "chore(fern): upgrade CLI 4.66.0 → 4.96.0 and 1 generator",
                body: "## Fern Upgrade\n...",
                commitMessage: "chore: upgrade fern cli 4.66.0 -> 4.96.0, typescript-sdk 3.63.4 -> 3.65.5"
            }
        };

        expect(exampleResult).toHaveProperty("cli");
        expect(exampleResult).toHaveProperty("generators");
        expect(exampleResult).toHaveProperty("skippedMajor");
        expect(exampleResult).toHaveProperty("alreadyUpToDate");
        expect(exampleResult).toHaveProperty("pr");

        expect(exampleResult.cli).toHaveProperty("from");
        expect(exampleResult.cli).toHaveProperty("to");
        expect(exampleResult.cli).toHaveProperty("upgraded");

        const gen = exampleResult.generators[0];
        expect(gen).toBeDefined();
        expect(gen).toHaveProperty("name");
        expect(gen).toHaveProperty("group");
        expect(gen).toHaveProperty("api");
        expect(gen).toHaveProperty("from");
        expect(gen).toHaveProperty("to");
        expect(gen).toHaveProperty("changelog");
        expect(gen).toHaveProperty("migrationsApplied");

        const skip = exampleResult.skippedMajor[0];
        expect(skip).toBeDefined();
        expect(skip).toHaveProperty("name");
        expect(skip).toHaveProperty("current");
        expect(skip).toHaveProperty("latest");

        const upToDate = exampleResult.alreadyUpToDate[0];
        expect(upToDate).toBeDefined();
        expect(upToDate).toHaveProperty("name");
        expect(upToDate).toHaveProperty("version");

        expect(exampleResult.pr).toHaveProperty("title");
        expect(exampleResult.pr).toHaveProperty("body");
        expect(exampleResult.pr).toHaveProperty("commitMessage");
    });

    it("pr is null when nothing changed", () => {
        const result = {
            cli: { from: "5.7.3", to: "5.7.3", upgraded: false },
            generators: [],
            skippedMajor: [],
            alreadyUpToDate: [{ name: "fernapi/fern-go-sdk", version: "1.37.0" }],
            pr: null
        };
        expect(result.pr).toBeNull();
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
