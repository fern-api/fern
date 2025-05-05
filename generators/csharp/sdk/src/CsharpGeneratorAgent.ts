import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class CsharpGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private readmeConfigBuilder: ReadmeConfigBuilder;

    public constructor({
        logger,
        config,
        readmeConfigBuilder
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
    }) {
        super({ logger, config });
        this.readmeConfigBuilder = readmeConfigBuilder;
    }

    public getReadmeConfig(
        args: AbstractGeneratorAgent.ReadmeConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.ReadmeConfig {
        return this.readmeConfigBuilder.build({
            context: args.context,
            remote: args.remote,
            featureConfig: args.featureConfig,
            endpointSnippets: args.endpointSnippets
        });
    }

    public getLanguage(): FernGeneratorCli.Language {
        return FernGeneratorCli.Language.Csharp;
    }

    public getGitHubConfig(
        args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.GitHubConfig {
        const randomString = Math.random().toString(36).substring(2, 15);
        const now = new Date();
        const gitFriendlyDate =
            now.getUTCFullYear() +
            String(now.getUTCMonth() + 1).padStart(2, "0") +
            String(now.getUTCDate()).padStart(2, "0") +
            "-" +
            String(now.getUTCHours()).padStart(2, "0") +
            String(now.getUTCMinutes()).padStart(2, "0") +
            String(now.getUTCSeconds()).padStart(2, "0") +
            String(now.getUTCMilliseconds()).padStart(3, "0") +
            "_" +
            randomString;
        return {
            sourceDirectory: "fern/output",
            uri: "https://github.com/fern-api/test-generate-cli-github.git",
            token: "token",
            branch: "jsklan/csharp_sdk_push_test/" + gitFriendlyDate
        };
    }
}
