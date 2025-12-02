import { AbstractGeneratorAgent, RawGithubConfig, ReferenceConfigBuilder } from "@fern-api/base-generator";
import { generateReadme, generateReference, githubPr, githubPush } from "@fern-api/generator-cli";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";

import { ReadmeConfigBuilder } from "./readme";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SwiftGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
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
        super({ logger, config, selfHosted: ir.selfHosted, skipInstall: true });
        this.readmeConfigBuilder = readmeConfigBuilder;
        this.publishConfig = ir.publishConfig;
    }

    /**
     * Generates the README.md content using the given generator context.
     */
    public override async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }): Promise<string> {
        const readmeConfig = this.getReadmeConfig({
            context,
            remote: this.getRemote(context),
            featureConfig: await this.readFeatureConfig(),
            endpointSnippets
        });
        return await generateReadme({ readmeConfig });
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

    public override async generateReference(builder: ReferenceConfigBuilder): Promise<string> {
        const referenceConfig = builder.build(this.getLanguage());
        return await generateReference({ referenceConfig });
    }

    public async pushToGitHubProgrammatic({ context }: { context: SdkGeneratorContext }): Promise<void> {
        const githubConfig = this.resolveGitHubConfig({ context });
        if (githubConfig.mode === "pull-request") {
            await githubPr({ githubConfig });
        } else {
            await githubPush({ githubConfig });
        }
    }

    public getLanguage(): FernGeneratorCli.Language {
        return FernGeneratorCli.Language.Swift;
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
