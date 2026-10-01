import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { getDynamicGeneratorConfig } from "../getDynamicGeneratorConfig.js";
import { getDocsSnippetPackageName } from "../publishDocs.js";
import { getDynamicIrUploadSkipReason } from "../runRemoteGenerationForGenerator.js";

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
            raw: { name: "fernapi/fern-python-sdk", version: "1.0.0", config: { package_name: "acme" } }
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
            raw: { name: "fernapi/fern-php-sdk", version: "1.0.0", config: { packageName: "acme/acme-php" } }
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

describe("getDynamicIrUploadSkipReason", () => {
    const ok = { hasResult: true, version: "1.0.0", language: "python", packageName: "acme", isPreview: false };

    it("returns undefined when upload should proceed", () => {
        expect(getDynamicIrUploadSkipReason(ok)).toBeUndefined();
    });

    it("names the missing package name", () => {
        expect(getDynamicIrUploadSkipReason({ ...ok, packageName: undefined })).toMatch(/package name/);
    });

    it("names preview runs", () => {
        expect(getDynamicIrUploadSkipReason({ ...ok, isPreview: true })).toBe("preview generation");
    });

    it("names a missing version", () => {
        expect(getDynamicIrUploadSkipReason({ ...ok, version: undefined })).toMatch(/version/);
    });
});
