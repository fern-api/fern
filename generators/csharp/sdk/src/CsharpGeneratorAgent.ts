import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { PublishingConfig } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class CsharpGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private readmeConfigBuilder: ReadmeConfigBuilder;
    private publishConfig: PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        readmeConfigBuilder,
        publishConfig
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
        publishConfig: PublishingConfig | undefined;
    }) {
        super({ logger, config });
        this.readmeConfigBuilder = readmeConfigBuilder;
        this.publishConfig = publishConfig;
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
        args.context.logger.info("Validating publishing config...");

        if (this.publishConfig == null) {
            args.context.logger.error("Publishing config is missing");
            throw new Error("Publishing config is required for GitHub actions");
        }

        if (this.publishConfig.type !== "github") {
            args.context.logger.error(`Publishing type ${this.publishConfig.type} is not supported`);
            throw new Error("Only GitHub publishing is supported");
        }

        if (this.publishConfig.uri == null || this.publishConfig.token == null) {
            args.context.logger.error("GitHub URI or token is missing in publishing config");
            throw new Error("GitHub URI and token are required in publishing config");
        }

        args.context.logger.info("Generating GitHub branch name...");
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

        const branchName = "jsklan/csharp_sdk_push_test/" + gitFriendlyDate;
        args.context.logger.info(`Using branch name: ${branchName}`);

        return {
            sourceDirectory: "fern/output",
            uri: this.publishConfig.uri,
            token: this.publishConfig.token,
            branch: branchName
        };
    }
}
