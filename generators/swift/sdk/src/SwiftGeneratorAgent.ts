import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SwiftGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
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
        _args: AbstractGeneratorAgent.ReadmeConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.ReadmeConfig {
        // TODO(kafkas): Implement
        throw new Error("Not implemented");
    }

    public getLanguage(): FernGeneratorCli.Language {
        // TODO(kafkas): Implement
        throw new Error("Not implemented");
    }

    public getGitHubConfig(
        args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>
    ): FernGeneratorCli.GitHubConfig {
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

        return {
            sourceDirectory: "fern/output",
            uri: this.publishConfig.uri,
            token: this.publishConfig.token
        };
    }
}
