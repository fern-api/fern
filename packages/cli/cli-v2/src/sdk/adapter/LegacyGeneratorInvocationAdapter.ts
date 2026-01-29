import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { parseRepository } from "@fern-api/github";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { readFile } from "fs/promises";
import type { Context } from "../../context/Context";
import type { License } from "../config/License";
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
            switch (git.mode) {
                case "pr":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.pullRequest({
                            owner: repository.owner,
                            repo: repository.repo,
                            license,
                            publishInfo: undefined,
                            downloadSnippets: undefined,
                            reviewers: undefined
                        })
                    );
                case "release":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.commitAndRelease({
                            owner: repository.owner,
                            repo: repository.repo,
                            license,
                            publishInfo: undefined,
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
                            publishInfo: undefined,
                            downloadSnippets: undefined
                        })
                    );
                default:
                    assertNever(git.mode);
            }
        }

        // Default to downloadFiles for local output.
        return FernFiddle.remoteGen.OutputMode.downloadFiles({});
    }

    private async convertLicense(license: License): Promise<FernFiddle.GithubLicense> {
        switch (license.type) {
            case "MIT":
                return FernFiddle.GithubLicense.basic({
                    id: FernFiddle.GithubLicenseId.Mit
                });
            case "Apache-2.0":
                return FernFiddle.GithubLicense.basic({
                    id: FernFiddle.GithubLicenseId.Apache
                });
            case "custom": {
                const absolutePath = join(this.context.cwd, RelativeFilePath.of(license.path));
                if (!(await doesPathExist(absolutePath, "file"))) {
                    throw new Error(
                        `Custom license file "${absolutePath}" does not exist; did you mean to use either MIT or Apache-2.0?`
                    );
                }
                const contents = await readFile(absolutePath, "utf-8");
                return FernFiddle.GithubLicense.custom({ contents });
            }
            default:
                assertNever(license);
        }
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
