import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

import { AbstractGeneratorAgent } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class TypeScriptGeneratorAgent extends AbstractGeneratorAgent<SdkContext> {
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

    public getReadmeConfig(args: AbstractGeneratorAgent.ReadmeConfigArgs<SdkContext>): FernGeneratorCli.ReadmeConfig {
        return this.readmeConfigBuilder.build({
            context: args.context,
            remote: args.remote,
            featureConfig: args.featureConfig
        });
    }

    public getLanguage(): FernGeneratorCli.Language {
        return FernGeneratorCli.Language.Typescript;
    }

    public getExportedReadmeFilePath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: this.README_FILENAME
            },
            rootDir: ""
        };
    }

    public getExportedReferenceFilePath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: this.REFERENCE_FILENAME
            },
            rootDir: ""
        };
    }
}
