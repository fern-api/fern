import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { parseRepository } from "@fern-api/github";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
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

    public adapt(target: Target): generatorsYml.GeneratorInvocation {
        return {
            name: target.image,
            version: target.version,
            config: target.config,
            language: this.mapLanguage(target.lang),
            outputMode: this.buildOutputMode(target),
            absolutePathToLocalOutput: this.context.resolveOutputPath(target.output.path),

            // TODO: Add support for the following features.
            absolutePathToLocalSnippets: undefined,
            keywords: undefined,
            smartCasing: false,
            disableExamples: false,
            publishMetadata: undefined,
            readme: undefined,
            settings: undefined,
            irVersionOverride: undefined
        };
    }

    private buildOutputMode(target: Target): FernFiddle.remoteGen.OutputMode {
        if (target.output.git != null) {
            const git = target.output.git;
            const repository = parseRepository(git.repository);
            switch (git.mode) {
                case "pr":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.pullRequest({
                            owner: repository.owner,
                            repo: repository.repo,
                            publishInfo: undefined,
                            license: undefined,
                            downloadSnippets: undefined,
                            reviewers: undefined
                        })
                    );
                case "release":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.commitAndRelease({
                            owner: repository.owner,
                            repo: repository.repo,
                            publishInfo: undefined,
                            license: undefined,
                            downloadSnippets: undefined
                        })
                    );
                case "push":
                    return FernFiddle.remoteGen.OutputMode.githubV2(
                        FernFiddle.GithubOutputModeV2.push({
                            owner: repository.owner,
                            repo: repository.repo,
                            branch: git.branch,
                            publishInfo: undefined,
                            license: undefined,
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
