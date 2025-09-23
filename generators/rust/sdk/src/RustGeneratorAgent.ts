import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";

import { ReadmeConfigBuilder } from "./readme";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class RustGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private publishConfig: PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        ir
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        ir: IntermediateRepresentation;
    }) {
        super({ logger, config, selfHosted: ir.selfHosted });
        this.publishConfig = ir.publishConfig;
    }

    public getReadmeConfig(
        args: AbstractGeneratorAgent.ReadmeConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.ReadmeConfig {
        const readmeConfigBuilder = new ReadmeConfigBuilder({
            endpointSnippets: args.endpointSnippets
        });
        return readmeConfigBuilder.build({
            context: args.context,
            remote: args.remote,
            featureConfig: args.featureConfig
        });
    }

    public getLanguage(): FernGeneratorCli.Language {
        // TODO: Update when Rust is added to FernGeneratorCli.Language enum
        return "rust" as FernGeneratorCli.Language;
    }

    public getGitHubConfig(
        args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>
    ): RawGithubConfig {
        return {
            sourceDirectory: "fern/output",
            type: this.publishConfig?.type,
            uri: this.publishConfig?.type === "github" ? this.publishConfig.uri : undefined,
            token: this.publishConfig?.type === "github" ? this.publishConfig.token : undefined,
        };
    }   
}
