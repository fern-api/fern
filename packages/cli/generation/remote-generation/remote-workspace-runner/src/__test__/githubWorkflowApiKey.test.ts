import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it, vi } from "vitest";

import { replaceEnvVariablesPreservingWorkflowApiKey } from "../githubWorkflowApiKey.js";

function invocation(outputMode: FernFiddle.OutputMode): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-csharp-sdk",
        version: "1.0.0",
        language: "csharp",
        config: {},
        keywords: [],
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode
    } as unknown as generatorsYml.GeneratorInvocation;
}

function githubV2(publishInfo: FernFiddle.GithubPublishInfo): FernFiddle.OutputMode {
    return FernFiddle.OutputMode.githubV2(
        FernFiddle.GithubOutputModeV2.push({
            owner: "acme",
            repo: "petstore-dotnet",
            publishInfo,
            downloadSnippets: false,
            workflows: true
        })
    );
}

function nugetPublishInfo(apiKey: string | undefined): FernFiddle.GithubPublishInfo {
    return FernFiddle.GithubPublishInfo.nuget({
        registryUrl: "https://nuget.org/",
        packageName: "Acme.Sdk",
        apiKey
    });
}

function publishInfoOf(resolved: generatorsYml.GeneratorInvocation): Record<string, unknown> {
    const outputMode = resolved.outputMode;
    if (outputMode.type !== "githubV2") {
        throw new Error("expected a githubV2 output mode");
    }
    return outputMode.githubV2.publishInfo as unknown as Record<string, unknown>;
}

const throwOnError = {
    onError: (message?: string) => {
        throw new Error(message ?? "env var missing");
    }
};

describe("replaceEnvVariablesPreservingWorkflowApiKey", () => {
    it("keeps a GitHub NuGet api-key as a secret name instead of resolving it", () => {
        vi.stubEnv("MY_NUGET_KEY", "the-real-key");

        const resolved = replaceEnvVariablesPreservingWorkflowApiKey(
            invocation(githubV2(nugetPublishInfo("${MY_NUGET_KEY}"))),
            throwOnError
        );

        // Resolving it would hand sdk-gen-api the key and lose the only thing it needs: the name.
        expect(publishInfoOf(resolved).apiKey).toBe("${MY_NUGET_KEY}");
        expect(JSON.stringify(resolved)).not.toContain("the-real-key");
    });

    it("does not require the secret to exist in the local environment", () => {
        vi.stubEnv("MY_NUGET_KEY", undefined);

        // The secret lives in GitHub by design, so demanding it locally fails generation outright.
        expect(() =>
            replaceEnvVariablesPreservingWorkflowApiKey(
                invocation(githubV2(nugetPublishInfo("${MY_NUGET_KEY}"))),
                throwOnError
            )
        ).not.toThrow();
    });

    it("keeps a GitHub RubyGems api-key the same way", () => {
        vi.stubEnv("MY_GEM_KEY", "the-real-gem-key");

        const resolved = replaceEnvVariablesPreservingWorkflowApiKey(
            invocation(
                githubV2(
                    FernFiddle.GithubPublishInfo.rubygems({
                        registryUrl: "https://rubygems.org/",
                        packageName: "acme-sdk",
                        apiKey: "${MY_GEM_KEY}"
                    })
                )
            ),
            throwOnError
        );

        expect(publishInfoOf(resolved).apiKey).toBe("${MY_GEM_KEY}");
        expect(JSON.stringify(resolved)).not.toContain("the-real-gem-key");
    });

    it("leaves OIDC alone, so trusted publishing still selects its own branch", () => {
        const resolved = replaceEnvVariablesPreservingWorkflowApiKey(
            invocation(githubV2(nugetPublishInfo("OIDC"))),
            throwOnError
        );

        expect(publishInfoOf(resolved).apiKey).toBe("OIDC");
    });

    it("still substitutes every other value in the invocation", () => {
        vi.stubEnv("MY_NUGET_KEY", "the-real-key");
        vi.stubEnv("MY_REGISTRY", "https://nuget.example.com/");

        const resolved = replaceEnvVariablesPreservingWorkflowApiKey(
            invocation(
                githubV2(
                    FernFiddle.GithubPublishInfo.nuget({
                        registryUrl: "${MY_REGISTRY}",
                        packageName: "Acme.Sdk",
                        apiKey: "${MY_NUGET_KEY}"
                    })
                )
            ),
            throwOnError
        );

        expect(publishInfoOf(resolved)).toMatchObject({
            registryUrl: "https://nuget.example.com/",
            apiKey: "${MY_NUGET_KEY}"
        });
    });

    it("resolves a directly published NuGet key, which is a real credential", () => {
        vi.stubEnv("MY_NUGET_KEY", "the-real-key");

        const resolved = replaceEnvVariablesPreservingWorkflowApiKey(
            invocation(
                FernFiddle.OutputMode.publishV2(
                    FernFiddle.PublishOutputModeV2.nugetOverride({
                        registryUrl: "https://nuget.org/",
                        packageName: "Acme.Sdk",
                        apiKey: "${MY_NUGET_KEY}"
                    })
                )
            ),
            throwOnError
        );

        const outputMode = resolved.outputMode;
        if (outputMode.type !== "publishV2" || outputMode.publishV2.type !== "nugetOverride") {
            throw new Error("expected a publishV2 nugetOverride output mode");
        }
        expect(outputMode.publishV2.nugetOverride.apiKey).toBe("the-real-key");
    });
});
