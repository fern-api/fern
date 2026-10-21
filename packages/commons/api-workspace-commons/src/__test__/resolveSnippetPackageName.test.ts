import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { resolveSnippetPackageName } from "../resolveSnippetPackageName.js";

const github = { owner: "acme", repo: "acme-python" };
const pypi = FernFiddle.GithubPublishInfo.pypi({
    registryUrl: "https://upload.pypi.org/legacy/",
    packageName: "acme",
    credentials: { username: "__token__", password: "token" }
});

function invocation(
    overrides: Partial<generatorsYml.GeneratorInvocation> & Pick<generatorsYml.GeneratorInvocation, "outputMode">
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-python-sdk",
        version: "1.0.0",
        language: "python",
        config: undefined,
        ...overrides
        // biome-ignore lint/suspicious/noExplicitAny: test stub
    } as any;
}

describe("resolveSnippetPackageName", () => {
    it("v1 github with publishInfo resolves from publishInfo", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.github({ ...github, makePr: false, publishInfo: pypi })
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("v1 github without publishInfo falls back to config.package_name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.github({ ...github, makePr: false }),
            config: { package_name: "acme" }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("falls back to raw.config when the resolved config is absent", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.github({ owner: github.owner, repo: github.repo }),
            config: undefined,
            raw: { name: "fernapi/fern-python-sdk", version: "1.0.0", config: { package_name: "acme" } }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("v1 github without publishInfo or config resolves nothing", () => {
        const gi = invocation({ outputMode: FernFiddle.OutputMode.github({ ...github, makePr: false }) });
        expect(resolveSnippetPackageName(gi)).toBeUndefined();
    });

    it("githubV2 pull-request with a pypi block resolves from publishInfo", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.pullRequest({ ...github, publishInfo: pypi })
            )
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("githubV2 pull-request without publishInfo falls back to config.package_name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github })),
            config: { package_name: "acme" }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("publish output mode falls back to output.package-name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.publish({ registryOverrides: {} }),
            raw: {
                name: "fernapi/fern-python-sdk",
                version: "1.0.0",
                output: { location: "pypi", "package-name": "acme" }
            }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("publishV2 output mode falls back to output.package-name", () => {
        const gi = invocation({
            outputMode: FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://registry.npmjs.org",
                    packageName: "acme",
                    token: "token"
                })
            ),
            raw: {
                name: "fernapi/fern-python-sdk",
                version: "1.0.0",
                output: { location: "pypi", "package-name": "acme" }
            }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme");
    });

    it("php resolves from config.packageName", () => {
        const gi = invocation({
            language: "php",
            name: "fernapi/fern-php-sdk",
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github })),
            config: { packageName: "acme/acme-php" }
        });
        expect(resolveSnippetPackageName(gi)).toBe("acme/acme-php");
    });

    it("go resolves to the github repo path", () => {
        const gi = invocation({
            language: "go",
            outputMode: FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest({ ...github }))
        });
        expect(resolveSnippetPackageName(gi)).toBe("github.com/acme/acme-python");
    });
});
