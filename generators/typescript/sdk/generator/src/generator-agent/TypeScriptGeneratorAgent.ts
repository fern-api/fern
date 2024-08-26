import { AbstractGeneratorAgent } from "@fern-api/generator-commons";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { ReadmeConfigBuilder } from "./ReadmeConfigBuilder";
import { ReferenceConfigBuilder } from "./ReferenceConfigBuilder";
import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

export class TypeScriptGeneratorAgent extends AbstractGeneratorAgent<
    SdkContext,
    FernGeneratorCli.ReadmeConfig,
    FernGeneratorCli.ReferenceConfig
> {
    private readmeConfigBuilder: ReadmeConfigBuilder;
    private referenceConfigBuilder: ReferenceConfigBuilder;

    public constructor({
        logger,
        readmeConfigBuilder,
        referenceConfigBuilder
    }: {
        logger: Logger;
        readmeConfigBuilder: ReadmeConfigBuilder;
        referenceConfigBuilder: ReferenceConfigBuilder;
    }) {
        super(logger);
        this.readmeConfigBuilder = readmeConfigBuilder;
        this.referenceConfigBuilder = referenceConfigBuilder;
    }

    public getReadmeConfig(context: SdkContext): FernGeneratorCli.ReadmeConfig {
        return this.readmeConfigBuilder.build(context);
    }

    public getReferenceConfig(context: SdkContext): FernGeneratorCli.ReferenceConfig {
        return this.referenceConfigBuilder.build(context);
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
