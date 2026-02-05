import { schemas } from "@fern-api/config";
import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { parseRepository } from "@fern-api/github";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { readFile } from "fs/promises";
import type { Context } from "../../context/Context";
import type { Target } from "../config/Target";

export namespace LegacyGeneratorInvocationAdapter {
    export interface Config {
        /** The CLI context */
        context: Context;
    }
}

export class LegacyGeneratorInvocationAdapter {
    private readonly context: Context;

    constructor(config: LegacyGeneratorInvocationAdapter.Config) {
        this.context = config.context;
    }

    public async adapt(target: Target): Promise<generatorsYml.GeneratorInvocation> {
        return {
            name: target.image,
            version: target.version,
            config: target.config,
            language: this.mapLanguage(target.lang),
            outputMode: await this.buildOutputMode(target),
            absolutePathToLocalOutput: this.context.resolveOutputFilePath(target.output.path),
            smartCasing: target.smartCasing ?? true,
            readme: target.readme,

            // Legacy options which are no longer supported.
            absolutePathToLocalSnippets: undefined,
            disableExamples: false,
            irVersionOverride: undefined,
            keywords: undefined,
            publishMetadata: undefined,
            settings: undefined
        };
    }

    private async buildOutputMode(target: Target): Promise<FernFiddle.remoteGen.OutputMode> {
        if (target.output.git != null) {
            const git = target.output.git;
            const repository = parseRepository(git.repository);
            const license = git.license != null ? await this.convertLicense(git.license) : undefined;
            const publishInfo = target.publish != null ? this.buildPublishInfo(target.publish) : undefined;
            const reviewers = this.buildReviewers(git.reviewers);
            const mode = git.mode ?? "pr";

            switch (mode) {
                case "pr":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.pullRequest({
                            owner: repository.owner,
                            repo: repository.repo,
                            license,
                            publishInfo,
                            reviewers,
                            downloadSnippets: undefined
                        })
                    );
                case "release":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.commitAndRelease({
                            owner: repository.owner,
                            repo: repository.repo,
                            license,
                            publishInfo,
                            downloadSnippets: undefined
                        })
                    );
                case "push":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.push({
                            owner: repository.owner,
                            repo: repository.repo,
                            branch: git.branch,
                            license,
                            publishInfo,
                            downloadSnippets: undefined
                        })
                    );
                default:
                    assertNever(mode);
            }
        }
        // Default to downloadFiles for local output.
        return FernFiddle.remoteGen.OutputMode.downloadFiles({});
    }

    private buildPublishInfo(publish: schemas.PublishSchema): FernFiddle.GithubPublishInfo | undefined {
        if (publish.npm != null) {
            return this.buildNpmPublishInfo(publish.npm);
        }
        if (publish.pypi != null) {
            return this.buildPypiPublishInfo(publish.pypi);
        }
        if (publish.maven != null) {
            return this.buildMavenPublishInfo(publish.maven);
        }
        if (publish.nuget != null) {
            return this.buildNugetPublishInfo(publish.nuget);
        }
        if (publish.rubygems != null) {
            return this.buildRubygemsPublishInfo(publish.rubygems);
        }
        if (publish.crates != null) {
            return this.buildCratesPublishInfo(publish.crates);
        }
        return undefined;
    }

    private buildNpmPublishInfo(npm: schemas.NpmPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.npm({
            registryUrl: npm.url ?? "https://registry.npmjs.org",
            packageName: npm.packageName,
            token: npm.token
        });
    }

    private buildPypiPublishInfo(pypi: schemas.PypiPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.pypi({
            registryUrl: pypi.url ?? "https://upload.pypi.org/legacy/",
            packageName: pypi.packageName,
            credentials:
                pypi.token != null
                    ? { username: "__token__", password: pypi.token }
                    : pypi.username != null && pypi.password != null
                      ? { username: pypi.username, password: pypi.password }
                      : undefined,
            pypiMetadata:
                pypi.metadata != null
                    ? {
                          keywords: pypi.metadata.keywords,
                          documentationLink: pypi.metadata.documentationLink,
                          homepageLink: pypi.metadata.homepageLink
                      }
                    : undefined
        });
    }

    private buildMavenPublishInfo(maven: schemas.MavenPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.maven({
            registryUrl: maven.url ?? "https://s01.oss.sonatype.org/content/repositories/releases/",
            coordinate: maven.coordinate,
            credentials:
                maven.username != null && maven.password != null
                    ? { username: maven.username, password: maven.password }
                    : undefined,
            signature:
                maven.signature != null
                    ? {
                          keyId: maven.signature.keyId,
                          password: maven.signature.password,
                          secretKey: maven.signature.secretKey
                      }
                    : undefined
        });
    }

    private buildNugetPublishInfo(nuget: schemas.NugetPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.nuget({
            registryUrl: nuget.url ?? "https://nuget.org/",
            packageName: nuget.packageName,
            apiKey: nuget.apiKey
        });
    }

    private buildRubygemsPublishInfo(rubygems: schemas.RubygemsPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.rubygems({
            registryUrl: rubygems.url ?? "https://rubygems.org/",
            packageName: rubygems.packageName,
            apiKey: rubygems.apiKey
        });
    }

    private buildCratesPublishInfo(crates: schemas.CratesPublishSchema): FernFiddle.GithubPublishInfo {
        return FernFiddle.GithubPublishInfo.crates({
            registryUrl: crates.url ?? "https://crates.io/api/v1/crates",
            packageName: crates.packageName,
            token: crates.token
        });
    }

    private buildReviewers(
        reviewers: schemas.ReviewersSchema | undefined
    ): FernFiddle.GithubPullRequestReviewer[] | undefined {
        if (reviewers == null) {
            return undefined;
        }
        const result: FernFiddle.GithubPullRequestReviewer[] = [];
        if (reviewers.teams != null) {
            for (const team of reviewers.teams) {
                result.push(FernFiddle.GithubPullRequestReviewer.team({ name: team }));
            }
        }
        if (reviewers.users != null) {
            for (const user of reviewers.users) {
                result.push(FernFiddle.GithubPullRequestReviewer.user({ name: user }));
            }
        }
        return result.length > 0 ? result : undefined;
    }

    private async convertLicense(license: schemas.LicenseSchema): Promise<FernFiddle.GithubLicense> {
        if (license === "MIT") {
            return FernFiddle.GithubLicense.basic({
                id: FernFiddle.GithubLicenseId.Mit
            });
        }
        if (license === "Apache-2.0") {
            return FernFiddle.GithubLicense.basic({
                id: FernFiddle.GithubLicenseId.Apache
            });
        }
        const absolutePath = join(this.context.cwd, RelativeFilePath.of(license));
        if (!(await doesPathExist(absolutePath, "file"))) {
            throw new Error(
                `Custom license file "${absolutePath}" does not exist; did you mean to use either MIT or Apache-2.0?`
            );
        }
        const contents = await readFile(absolutePath, "utf-8");
        return FernFiddle.GithubLicense.custom({ contents });
    }

    private mapLanguage(lang: string): generatorsYml.GenerationLanguage | undefined {
        const languageMap: Record<string, generatorsYml.GenerationLanguage> = {
            typescript: generatorsYml.GenerationLanguage.TYPESCRIPT,
            python: generatorsYml.GenerationLanguage.PYTHON,
            java: generatorsYml.GenerationLanguage.JAVA,
            go: generatorsYml.GenerationLanguage.GO,
            ruby: generatorsYml.GenerationLanguage.RUBY,
            csharp: generatorsYml.GenerationLanguage.CSHARP,
            swift: generatorsYml.GenerationLanguage.SWIFT,
            php: generatorsYml.GenerationLanguage.PHP,
            rust: generatorsYml.GenerationLanguage.RUST
        };
        return languageMap[lang.toLowerCase()];
    }
}
