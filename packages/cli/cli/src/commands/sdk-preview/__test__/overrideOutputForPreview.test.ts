import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";
import {
    getGithubOwnerRepo,
    isNpmGenerator,
    overrideGroupOutputForDownload,
    overrideGroupOutputForPreview
} from "../overrideOutputForPreview.js";

/**
 * Creates a minimal GeneratorInvocation for testing.
 * Only the fields relevant to output mode override logic are set;
 * everything else uses safe defaults.
 */
function makeGenerator(
    outputMode: FernFiddle.remoteGen.OutputMode,
    overrides?: Partial<generatorsYml.GeneratorInvocation>
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-typescript-node-sdk",
        version: "0.57.10",
        config: {},
        outputMode,
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/test-output"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        language: undefined,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        ...overrides
    };
}

function makeGroup(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        groupName: "test-group",
        audiences: { type: "all" },
        generators,
        reviewers: undefined
    };
}

describe("isNpmGenerator", () => {
    it("recognizes known TypeScript SDK generators", () => {
        expect(isNpmGenerator("fernapi/fern-typescript-node-sdk")).toBe(true);
        expect(isNpmGenerator("fernapi/fern-typescript-browser-sdk")).toBe(true);
        expect(isNpmGenerator("fernapi/fern-typescript-sdk")).toBe(true);
    });

    it("rejects unknown typescript generators not in the set", () => {
        expect(isNpmGenerator("custom/my-typescript-generator")).toBe(false);
    });

    it("rejects Python generators", () => {
        expect(isNpmGenerator("fernapi/fern-python-sdk")).toBe(false);
    });

    it("rejects Java generators", () => {
        expect(isNpmGenerator("fernapi/fern-java-sdk")).toBe(false);
    });

    it("rejects Go generators", () => {
        expect(isNpmGenerator("fernapi/fern-go-sdk")).toBe(false);
    });

    it("rejects Ruby generators", () => {
        expect(isNpmGenerator("fernapi/fern-ruby-sdk")).toBe(false);
    });

    it("rejects C# generators", () => {
        expect(isNpmGenerator("fernapi/fern-csharp-sdk")).toBe(false);
    });
});

describe("getGithubOwnerRepo", () => {
    it("returns undefined for downloadFiles", () => {
        const mode = FernFiddle.remoteGen.OutputMode.downloadFiles({});
        expect(getGithubOwnerRepo(mode)).toBeUndefined();
    });

    it("extracts owner/repo from github (v1)", () => {
        const mode = FernFiddle.OutputMode.github({
            owner: "fern-api",
            repo: "fern-typescript-sdk"
        });
        expect(getGithubOwnerRepo(mode)).toEqual({ owner: "fern-api", repo: "fern-typescript-sdk" });
    });

    it("extracts owner/repo from githubV2 push", () => {
        const mode = FernFiddle.OutputMode.githubV2(
            FernFiddle.GithubOutputModeV2.push({
                owner: "fern-demo",
                repo: "sdk-preview-test-sdk",
                branch: undefined,
                license: undefined,
                downloadSnippets: false
            })
        );
        expect(getGithubOwnerRepo(mode)).toEqual({ owner: "fern-demo", repo: "sdk-preview-test-sdk" });
    });

    it("extracts owner/repo from githubV2 commitAndRelease", () => {
        const mode = FernFiddle.OutputMode.githubV2(
            FernFiddle.GithubOutputModeV2.commitAndRelease({
                owner: "my-org",
                repo: "my-sdk"
            })
        );
        expect(getGithubOwnerRepo(mode)).toEqual({ owner: "my-org", repo: "my-sdk" });
    });

    it("extracts owner/repo from githubV2 pullRequest", () => {
        const mode = FernFiddle.OutputMode.githubV2(
            FernFiddle.GithubOutputModeV2.pullRequest({
                owner: "acme",
                repo: "acme-sdk"
            })
        );
        expect(getGithubOwnerRepo(mode)).toEqual({ owner: "acme", repo: "acme-sdk" });
    });

    it("returns undefined for publish (v1)", () => {
        const mode = FernFiddle.OutputMode.publish({
            registryOverrides: {
                npm: {
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "token"
                }
            }
        });
        expect(getGithubOwnerRepo(mode)).toBeUndefined();
    });

    it("returns undefined for publishV2 — registry-only, no owner/repo", () => {
        const mode = FernFiddle.OutputMode.publishV2(
            FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                registryUrl: "https://npm.buildwithfern.com",
                packageName: "@acme/sdk",
                token: "token",
                downloadSnippets: false
            })
        );
        expect(getGithubOwnerRepo(mode)).toBeUndefined();
    });
});

describe("overrideGroupOutputForDownload", () => {
    it("overrides output mode to downloadFiles", () => {
        const generator = makeGenerator(
            FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "token",
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDownload({ group });

        expect(result.generators).toHaveLength(1);
        expect(result.generators[0]?.outputMode.type).toBe("downloadFiles");
        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("preserves other generator fields", () => {
        const generator = makeGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }), {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0"
        });
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDownload({ group });

        expect(result.generators[0]?.name).toBe("fernapi/fern-typescript-sdk");
        expect(result.generators[0]?.version).toBe("1.0.0");
    });

    it("overrides all generators in the group", () => {
        const gen1 = makeGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }));
        const gen2 = makeGenerator(
            FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://npm.buildwithfern.com",
                    packageName: "@acme/sdk",
                    token: "t",
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([gen1, gen2]);

        const result = overrideGroupOutputForDownload({ group });

        expect(result.generators).toHaveLength(2);
        for (const gen of result.generators) {
            expect(gen.outputMode.type).toBe("downloadFiles");
        }
    });
});

describe("overrideGroupOutputForPreview", () => {
    const previewParams = {
        packageName: "@fern-preview/acme-sdk",
        token: "fern-token-123",
        registryUrl: "https://npm.buildwithfern.com"
    };

    it("uses publishV2(npmOverride) by default (no pushDiff)", () => {
        const generator = makeGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators).toHaveLength(1);
        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("publishV2");
        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("uses publishV2(npmOverride) when pushDiff is false", () => {
        const generator = makeGenerator(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "fern-demo",
                    repo: "sdk-repo",
                    branch: undefined,
                    license: undefined,
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams, pushDiff: false });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("uses githubV2(push) with publishInfo when pushDiff is true and generator has github config", () => {
        const generator = makeGenerator(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "fern-demo",
                    repo: "sdk-preview-test-sdk",
                    branch: undefined,
                    license: undefined,
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams, pushDiff: true });

        expect(result.generators).toHaveLength(1);
        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("githubV2");
    });

    it("falls back to publishV2(npmOverride) when pushDiff is true but generator has no github config", () => {
        const generator = makeGenerator(
            FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "original-token",
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams, pushDiff: true });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("falls back to publishV2(npmOverride) when pushDiff is true but generator uses downloadFiles", () => {
        const generator = makeGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams, pushDiff: true });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("extracts owner/repo from github v1 when pushDiff is true", () => {
        const generator = makeGenerator(FernFiddle.OutputMode.github({ owner: "legacy-org", repo: "legacy-sdk" }));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams, pushDiff: true });

        expect(result.generators[0]?.outputMode.type).toBe("githubV2");
    });

    it("clears absolutePathToLocalOutput", () => {
        const generator = makeGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }), {
            absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/original-output")
        });
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("preserves group-level fields", () => {
        const generator = makeGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);
        group.groupName = "my-preview-group";

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.groupName).toBe("my-preview-group");
    });
});
