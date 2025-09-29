import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class PythonGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
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
        throw new Error("Method not implemented.");
    }

    public getLanguage(): FernGeneratorCli.Language {
        return FernGeneratorCli.Language.Python;
    }

    public getGitHubConfig(args: AbstractGeneratorAgent.GitHubConfigArgs<SdkGeneratorContext>): RawGithubConfig {
        return {
            sourceDirectory: "fern/output",
            type: this.publishConfig?.type,
            uri: this.publishConfig?.type === "github" ? this.publishConfig.uri : undefined,
            token: this.publishConfig?.type === "github" ? this.publishConfig.token : undefined,
            mode: this.publishConfig?.type === "github" ? this.publishConfig.mode : undefined
        };
    }
}
