import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";

export class PythonGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private publishConfig: FernIr.PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        ir
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        ir: FernIr.IntermediateRepresentation;
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
        const githubConfig = this.publishConfig?.type === "github" ? this.publishConfig : undefined;
        return {
            sourceDirectory: "fern/output",
            type: this.publishConfig?.type,
            uri: githubConfig?.uri,
            token: githubConfig?.token,
            branch: undefined,
            mode: githubConfig?.mode
        };
    }
}
