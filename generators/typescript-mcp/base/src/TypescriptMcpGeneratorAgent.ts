import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { AbstractTypescriptMcpGeneratorContext } from "./context/AbstractTypescriptMcpGeneratorContext";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class TypescriptMcpGeneratorAgent extends AbstractGeneratorAgent<
    AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>
> {
    private readmeConfigBuilder: ReadmeConfigBuilder;

    public constructor({
        logger,
        config,
        readmeConfigBuilder
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        readmeConfigBuilder: ReadmeConfigBuilder;
    }) {
        super({ logger, config });
        this.readmeConfigBuilder = readmeConfigBuilder;
    }

    public getReadmeConfig(
        args: AbstractGeneratorAgent.ReadmeConfigArgs<
            AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>
        >
    ): FernGeneratorCli.ReadmeConfig {
        return this.readmeConfigBuilder.build({
            context: args.context,
            remote: args.remote,
            featureConfig: args.featureConfig
        });
    }

    public getLanguage(): FernGeneratorCli.Language {
        return FernGeneratorCli.Language.Typescript;
    }
}
