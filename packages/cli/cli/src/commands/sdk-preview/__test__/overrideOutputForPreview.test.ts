import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";
import {
    getGithubOwnerRepo,
    overrideGroupOutputForDiffBranch,
    overrideGroupOutputForDownload,
    overrideGroupOutputForPreview
} from "../overrideOutputForPreview.js";
import { makeGroup, makeNpmGenerator, makePypiGenerator } from "./test-utils.js";

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
        const generator = makeNpmGenerator(
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
        const generator = makeNpmGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }), {
            name: "fernapi/fern-typescript-sdk",
            version: "1.0.0"
        });
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDownload({ group });

        expect(result.generators[0]?.name).toBe("fernapi/fern-typescript-sdk");
        expect(result.generators[0]?.version).toBe("1.0.0");
    });

    it("overrides all generators in the group", () => {
        const gen1 = makeNpmGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }));
        const gen2 = makeNpmGenerator(
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
        language: "npm" as const,
        packageName: "@fern-preview/acme-sdk",
        token: "fern-token-123",
        registryUrl: "https://npm.buildwithfern.com"
    };

    it("always uses publishV2(npmOverride) for github output modes", () => {
        const generator = makeNpmGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators).toHaveLength(1);
        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("publishV2");
        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("uses publishV2(npmOverride) for githubV2 output modes", () => {
        const generator = makeNpmGenerator(
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

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("uses publishV2(npmOverride) for existing publishV2 output modes", () => {
        const generator = makeNpmGenerator(
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

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("uses publishV2(npmOverride) for downloadFiles output modes", () => {
        const generator = makeNpmGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators[0]?.outputMode.type).toBe("publishV2");
    });

    it("clears absolutePathToLocalOutput", () => {
        const generator = makeNpmGenerator(FernFiddle.OutputMode.github({ owner: "o", repo: "r" }), {
            absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/original-output")
        });
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("preserves group-level fields", () => {
        const generator = makeNpmGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);
        group.groupName = "my-preview-group";

        const result = overrideGroupOutputForPreview({ group, ...previewParams });

        expect(result.groupName).toBe("my-preview-group");
    });
});

describe("overrideGroupOutputForDiffBranch", () => {
    it("produces githubV2(push) for generators with github config", () => {
        const generator = makeNpmGenerator(
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

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(1);
        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("githubV2");
        expect(result.generators[0]?.absolutePathToLocalOutput).toBeUndefined();
    });

    it("preserves publishInfo package name but strips token from the original output mode", () => {
        const npmPublishInfo = FernFiddle.GithubPublishInfo.npm({
            registryUrl: "https://registry.npmjs.org",
            packageName: "@fern-demo/sdk-preview-test",
            token: "npm-token-123"
        });
        const generator = makeNpmGenerator(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "fern-demo",
                    repo: "sdk-preview-test-sdk",
                    branch: undefined,
                    license: undefined,
                    publishInfo: npmPublishInfo,
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(1);
        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("githubV2");

        // Extract the publishInfo from the nested githubV2 > push structure.
        // The publishInfo should preserve the package name for code generation
        // but strip the auth token to prevent accidental publishing.
        let extractedPublishInfo: FernFiddle.GithubPublishInfo | undefined;
        outputMode?._visit({
            githubV2: (v) => {
                v._visit({
                    push: (p) => {
                        extractedPublishInfo = p.publishInfo;
                    },
                    commitAndRelease: () => undefined,
                    pullRequest: () => undefined,
                    _other: () => undefined
                });
            },
            downloadFiles: () => undefined,
            github: () => undefined,
            publish: () => undefined,
            publishV2: () => undefined,
            _other: () => undefined
        });

        expect(extractedPublishInfo).toBeDefined();
        expect(extractedPublishInfo?.type).toBe("npm");

        let npmPackageName: string | undefined;
        let npmRegistryUrl: string | undefined;
        let npmToken: string | undefined;
        extractedPublishInfo?._visit({
            npm: (npm) => {
                npmPackageName = npm.packageName;
                npmRegistryUrl = npm.registryUrl;
                npmToken = npm.token;
            },
            maven: () => undefined,
            postman: () => undefined,
            pypi: () => undefined,
            nuget: () => undefined,
            rubygems: () => undefined,
            crates: () => undefined,
            _other: () => undefined
        });

        expect(npmPackageName).toBe("@fern-demo/sdk-preview-test");
        expect(npmRegistryUrl).toBe("https://registry.npmjs.org");
        expect(npmToken).toBeUndefined();
    });

    it("extracts owner/repo from github v1 output mode", () => {
        const generator = makeNpmGenerator(FernFiddle.OutputMode.github({ owner: "legacy-org", repo: "legacy-sdk" }));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(1);
        expect(result.generators[0]?.outputMode.type).toBe("githubV2");
    });

    it("extracts owner/repo from githubV2 commitAndRelease", () => {
        const generator = makeNpmGenerator(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.commitAndRelease({
                    owner: "my-org",
                    repo: "my-sdk"
                })
            )
        );
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(1);
        expect(result.generators[0]?.outputMode.type).toBe("githubV2");
    });

    it("excludes generators without github config (publishV2)", () => {
        const generator = makeNpmGenerator(
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

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(0);
    });

    it("excludes generators without github config (downloadFiles)", () => {
        const generator = makeNpmGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(0);
    });

    it("keeps only generators with github config in mixed groups", () => {
        const githubGen = makeNpmGenerator(
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
        const registryGen = makeNpmGenerator(
            FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: "https://npm.buildwithfern.com",
                    packageName: "@acme/sdk",
                    token: "t",
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([githubGen, registryGen]);

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.generators).toHaveLength(1);
        expect(result.generators[0]?.outputMode.type).toBe("githubV2");
    });

    it("preserves group-level fields", () => {
        const generator = makeNpmGenerator(
            FernFiddle.OutputMode.githubV2(
                FernFiddle.GithubOutputModeV2.push({
                    owner: "o",
                    repo: "r",
                    branch: undefined,
                    license: undefined,
                    downloadSnippets: false
                })
            )
        );
        const group = makeGroup([generator]);
        group.groupName = "my-diff-group";

        const result = overrideGroupOutputForDiffBranch({ group });

        expect(result.groupName).toBe("my-diff-group");
    });
});

describe("overrideGroupOutputForPreview - pypi", () => {
    it("uses publishV2(pypiOverride) when language is pypi", () => {
        const generator = makePypiGenerator(FernFiddle.remoteGen.OutputMode.downloadFiles({}));
        const group = makeGroup([generator]);
        const result = overrideGroupOutputForPreview({
            group,
            language: "pypi",
            packageName: "acme-preview-acme-sdk",
            token: "pypi-pw",
            registryUrl: "https://pypi.example.com/legacy/"
        });

        const outputMode = result.generators[0]?.outputMode;
        expect(outputMode?.type).toBe("publishV2");
        outputMode?._visit({
            publishV2: (v) =>
                v._visit({
                    pypiOverride: (p) => {
                        expect(p).toBeDefined();
                        expect(p?.coordinate).toBe("acme-preview-acme-sdk");
                        expect(p?.username).toBe("__token__");
                        expect(p?.password).toBe("pypi-pw");
                        expect(p?.registryUrl).toBe("https://pypi.example.com/legacy/");
                    },
                    npmOverride: () => expect.fail("expected pypiOverride"),
                    mavenOverride: () => expect.fail("expected pypiOverride"),
                    nugetOverride: () => expect.fail("expected pypiOverride"),
                    rubyGemsOverride: () => expect.fail("expected pypiOverride"),
                    cratesOverride: () => expect.fail("expected pypiOverride"),
                    postman: () => expect.fail("expected pypiOverride"),
                    _other: () => expect.fail("expected pypiOverride")
                }),
            downloadFiles: () => expect.fail("expected publishV2"),
            github: () => expect.fail("expected publishV2"),
            githubV2: () => expect.fail("expected publishV2"),
            publish: () => expect.fail("expected publishV2"),
            _other: () => expect.fail("expected publishV2")
        });
    });
});
