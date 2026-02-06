import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";

export class GoGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private readmeConfigBuilder: ReadmeConfigBuilder;
    private publishConfig: FernIr.PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        readmeConfigBuilder,
        publishConfig,
        ir
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
        publishConfig: FernIr.PublishingConfig | undefined;
        ir: FernIr.IntermediateRepresentation;
    }) {
        super({ logger, config, selfHosted: ir.selfHosted });
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
        return FernGeneratorCli.Language.Go;
    }

    public getGitHubConfig(args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>): RawGithubConfig {
        const githubConfig = this.publishConfig?.type === "github" ? this.publishConfig : undefined;
        return {
            sourceDirectory: "/fern/output",
            type: this.publishConfig?.type,
            uri: githubConfig?.uri,
            token: githubConfig?.token,
            branch: undefined,
            mode: githubConfig?.mode
        };
    }
}
