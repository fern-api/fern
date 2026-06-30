import type { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { getOutputRepoUrl } from "../automationMetadata.js";

/**
 * Builds a minimal `GeneratorInvocation` carrying only the `outputMode` under test. The remaining
 * fields are irrelevant to `getOutputRepoUrl` — the visitor only touches `outputMode`.
 */
function invocationWithOutputMode(outputMode: FernFiddle.remoteGen.OutputMode): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/test-sdk",
        version: "1.0.0",
        config: {},
        outputMode,
        automation: { generate: true, upgrade: true, preview: true, verify: true },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/unused"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        language: undefined,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("getOutputRepoUrl", () => {
    it("returns the repo URL for the legacy github output mode", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.github({ owner: "acme", repo: "sdk", makePr: false })
        );
        expect(getOutputRepoUrl(invocation)).toBe("https://github.com/acme/sdk");
    });

    it("returns the repo URL for githubV2 commitAndRelease", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.commitAndRelease({
                    owner: "acme",
                    repo: "sdk",
                    license: undefined,
                    publishInfo: undefined,
                    downloadSnippets: false
                })
            )
        );
        expect(getOutputRepoUrl(invocation)).toBe("https://github.com/acme/sdk");
    });

    it("returns the repo URL for githubV2 pullRequest", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({
                    owner: "acme",
                    repo: "sdk",
                    license: undefined,
                    publishInfo: undefined,
                    downloadSnippets: false,
                    reviewers: undefined,
                    branch: undefined
                })
            )
        );
        expect(getOutputRepoUrl(invocation)).toBe("https://github.com/acme/sdk");
    });

    it("returns the repo URL for githubV2 push", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "acme",
                    repo: "sdk",
                    branch: "main",
                    license: undefined,
                    publishInfo: undefined,
                    downloadSnippets: false
                })
            )
        );
        expect(getOutputRepoUrl(invocation)).toBe("https://github.com/acme/sdk");
    });

    it("returns undefined for downloadFiles (local-file-system) targets", () => {
        const invocation = invocationWithOutputMode(FernFiddle.OutputMode.downloadFiles({}));
        expect(getOutputRepoUrl(invocation)).toBeUndefined();
    });

    it("returns undefined for publish (legacy) targets", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.publish({
                registryOverrides: {
                    npm: {
                        registryUrl: "https://registry.npmjs.org",
                        packageName: "@acme/sdk",
                        token: "dummy"
                    }
                }
            })
        );
        expect(getOutputRepoUrl(invocation)).toBeUndefined();
    });

    it("returns undefined for publishV2 targets", () => {
        const invocation = invocationWithOutputMode(
            FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "@acme/sdk",
                    token: "dummy",
                    downloadSnippets: false
                })
            )
        );
        expect(getOutputRepoUrl(invocation)).toBeUndefined();
    });
});
