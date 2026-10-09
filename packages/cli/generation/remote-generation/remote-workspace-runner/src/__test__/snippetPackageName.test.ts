import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { getDynamicGeneratorConfig } from "../getDynamicGeneratorConfig.js";
import { getDocsSnippetPackageName, selectVersionGeneratorForSnippet } from "../publishDocs.js";
import { decideDynamicIrUpload } from "../runRemoteGenerationForGenerator.js";

const github = { owner: "acme", repo: "acme-python" };

function invocation(
    overrides: Partial<generatorsYml.GeneratorInvocation> & Pick<generatorsYml.GeneratorInvocation, "outputMode">
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-python-sdk",
        version: "1.0.0",
        language: "python",
        config: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        ...overrides
        // biome-ignore lint/suspicious/noExplicitAny: test stub
    } as any;
}

function docsPackageName(gi: generatorsYml.GeneratorInvocation): string | undefined {
    const dynamicGeneratorConfig = getDynamicGeneratorConfig({
        apiName: "api",
        organization: "acme",
        generatorInvocation: gi
    });
    return getDocsSnippetPackageName({ generatorInvocation: gi, dynamicGeneratorConfig });
}

describe("getDocsSnippetPackageName", () => {
    it("matches a python generator that is github-output-only via config.package_name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github })),
            config: { package_name: "acme" }
        });
        expect(docsPackageName(gi)).toBe("acme");
    });

    it("matches a python generator with a pypi publish block", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({
                    ...github,
                    publishInfo: FernFiddle.GithubPublishInfo.pypi({
                        registryUrl: "https://upload.pypi.org/legacy/",
                        packageName: "acme",
                        credentials: { username: "__token__", password: "token" }
                    })
                })
            )
        });
        expect(docsPackageName(gi)).toBe("acme");
    });

    it("returns undefined when nothing resolves a name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github }))
        });
        expect(docsPackageName(gi)).toBeUndefined();
    });

    it("php resolves from config.packageName", () => {
        const gi = invocation({
            language: "php",
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github })),
            config: { packageName: "acme/acme-php" }
        });
        expect(docsPackageName(gi)).toBe("acme/acme-php");
    });

    it("swift falls back to the repo url from the dynamic generator config", () => {
        const gi = invocation({
            language: "swift",
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github }))
        });
        expect(docsPackageName(gi)).toBe("https://github.com/acme/acme-python");
    });

    it("go is normalized to the snippets githubRepo format", () => {
        const gi = invocation({
            language: "go",
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github }))
        });
        expect(docsPackageName(gi)).toBe("github.com/acme/acme-python");
    });
});

describe("decideDynamicIrUpload", () => {
    const ok = {
        hasResult: true,
        version: "1.0.0",
        language: "python" as const,
        packageName: "acme",
        isPreview: false
    };

    it("returns the upload inputs when upload should proceed", () => {
        expect(decideDynamicIrUpload(ok)).toEqual({
            upload: true,
            version: "1.0.0",
            language: "python",
            packageName: "acme"
        });
    });

    it("names the missing package name", () => {
        const decision = decideDynamicIrUpload({ ...ok, packageName: undefined });
        expect(decision.upload).toBe(false);
        expect(!decision.upload && decision.reason).toMatch(/package name/);
    });

    it("reports preview before any config-looking condition", () => {
        const decision = decideDynamicIrUpload({ ...ok, isPreview: true, packageName: undefined, version: undefined });
        expect(decision).toEqual({ upload: false, reason: "preview generation" });
    });

    it("names a missing version", () => {
        const decision = decideDynamicIrUpload({ ...ok, version: undefined });
        expect(!decision.upload && decision.reason).toMatch(/version/);
    });

    it("prefers the detailed unresolved-version reason", () => {
        const decision = decideDynamicIrUpload({
            ...ok,
            version: undefined,
            versionUnresolvedReason: "computed candidate 1.0.1 but the registry reports 1.0.0"
        });
        expect(decision).toEqual({
            upload: false,
            reason: "computed candidate 1.0.1 but the registry reports 1.0.0"
        });
    });
});

describe("selectVersionGeneratorForSnippet", () => {
    const pypi = (packageName: string) =>
        FernFiddle.GithubPublishInfo.pypi({
            registryUrl: "https://upload.pypi.org/legacy/",
            packageName,
            credentials: { username: "__token__", password: "token" }
        });
    const githubOnly = (packageName: string) =>
        invocation({
            name: `gen-${packageName}`,
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github })),
            config: { package_name: packageName }
        });
    const published = (packageName: string) =>
        invocation({
            name: `gen-${packageName}`,
            outputMode: FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({ ...github, publishInfo: pypi(packageName) })
            )
        });

    it("selects the generator whose package matches the docs snippet name, regardless of order", () => {
        const selected = selectVersionGeneratorForSnippet({
            generators: [githubOnly("alpha"), published("beta")],
            language: "python",
            snippetName: "beta"
        });
        expect(selected).toMatchObject({
            generatorName: "gen-beta",
            generatorPackage: "beta",
            matchesSnippetName: true
        });
    });

    it("selects a github-output-only generator by config.package_name", () => {
        const selected = selectVersionGeneratorForSnippet({
            generators: [githubOnly("acme")],
            language: "python",
            snippetName: "acme"
        });
        expect(selected).toMatchObject({
            generatorPackage: "acme",
            githubRepository: "acme/acme-python",
            matchesSnippetName: true
        });
    });

    it("falls back to the first publish-target package when nothing matches", () => {
        const selected = selectVersionGeneratorForSnippet({
            generators: [githubOnly("alpha"), published("beta")],
            language: "python",
            snippetName: "gamma"
        });
        expect(selected).toMatchObject({ generatorPackage: "beta", matchesSnippetName: false });
    });

    it("does not fall back to config-only packages when nothing matches", () => {
        expect(
            selectVersionGeneratorForSnippet({
                generators: [githubOnly("alpha")],
                language: "python",
                snippetName: "gamma"
            })
        ).toBeUndefined();
    });

    it("normalizes go repo urls on both sides", () => {
        const go = invocation({
            name: "gen-go",
            language: "go",
            outputMode: FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({ owner: "acme", repo: "acme-go" })
            )
        });
        const selected = selectVersionGeneratorForSnippet({
            generators: [go],
            language: "go",
            snippetName: "https://github.com/acme/acme-go"
        });
        expect(selected?.matchesSnippetName).toBe(true);
    });
});
