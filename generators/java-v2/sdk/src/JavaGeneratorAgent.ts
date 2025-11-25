import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class JavaGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private readmeConfigBuilder: ReadmeConfigBuilder;
    private publishConfig: PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        readmeConfigBuilder,
        ir
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
        ir: IntermediateRepresentation;
    }) {
        super({ logger, config, selfHosted: ir.selfHosted });
        this.readmeConfigBuilder = readmeConfigBuilder;
        this.publishConfig = ir.publishConfig;
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

    public getGitHubConfig(args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>): RawGithubConfig {
        const githubConfig = this.publishConfig?.type === "github" ? this.publishConfig : undefined;
        return {
            sourceDirectory: "/fern/output",
            type: this.publishConfig?.type,
            uri: githubConfig?.uri,
            token: githubConfig?.token,
            branch: (githubConfig as { branch?: string } | undefined)?.branch,
            mode: githubConfig?.mode
        };
    }
}
