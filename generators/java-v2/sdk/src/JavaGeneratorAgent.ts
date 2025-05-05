import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { PublishingConfig } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class JavaGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
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
        publishConfig: PublishingConfig | undefined
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
        return FernGeneratorCli.Language.Java;
    }

    public getGitHubConfig(
        args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.GitHubConfig {
        if (this.publishConfig === undefined) {
            throw new Error("Cannot generate GitHub config because publishConfig is undefined");
        }

        if (this.publishConfig.type !== "github") {
            throw new Error(
                `Cannot generate GitHub config because publishing type is not 'github'. Found type: '${this.publishConfig.type}'`
            );
        }

        if (this.publishConfig.uri === undefined || this.publishConfig.uri === "") {
            throw new Error("Cannot generate GitHub config because 'uri' is missing in publishConfig");
        }

        if (this.publishConfig.token === undefined || this.publishConfig.token === "") {
            throw new Error("Cannot generate GitHub config because 'token' is missing in publishConfig");
        }

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
            uri: this.publishConfig.uri,
            token: this.publishConfig.token,
            branch: "jsklan/csharp_sdk_push_test/" + gitFriendlyDate
        };
    }
}
