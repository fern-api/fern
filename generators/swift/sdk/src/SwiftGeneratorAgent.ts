import { AbstractGeneratorAgent, RawGithubConfig, ReferenceConfigBuilder } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { generateReadme, generateReference, githubPr, githubPush } from "@fern-api/generator-cli";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { ReadmeConfigBuilder } from "./readme/index.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";

export class SwiftGeneratorAgent extends AbstractGeneratorAgent<SdkGeneratorContext> {
    private readmeConfigBuilder: ReadmeConfigBuilder;
    private publishConfig: FernIr.PublishingConfig | undefined;

    public constructor({
        logger,
        config,
        readmeConfigBuilder,
        ir
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
        ir: FernIr.IntermediateRepresentation;
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
    }): Promise<string | undefined> {
        try {
            const readmeConfig = this.getReadmeConfig({
                context,
                remote: this.getRemote(context),
                featureConfig: await this.readFeatureConfig(),
                endpointSnippets
            });
            return await generateReadme({ readmeConfig });
        } catch (error) {
            this.logger.warn(
                `Skipping README generation; the rest of the SDK was generated normally. Reason: ${extractErrorMessage(error)}`
            );
            return undefined;
        }
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

    public override async generateReference(builder: ReferenceConfigBuilder): Promise<string | undefined> {
        try {
            const referenceConfig = builder.build(this.getLanguage());
            return await generateReference({ referenceConfig });
        } catch (error) {
            this.logger.warn(
                `Skipping API reference generation; the rest of the SDK was generated normally. Reason: ${extractErrorMessage(error)}`
            );
            return undefined;
        }
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
