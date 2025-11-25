import { AbstractGeneratorAgent, RawGithubConfig } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, PublishingConfig } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class TypeScriptGeneratorAgent extends AbstractGeneratorAgent<SdkContext> {
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
        super({ logger, config, selfHosted: false });
        this.readmeConfigBuilder = readmeConfigBuilder;
        this.publishConfig = ir.publishConfig;
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

    public getExportedContributingFilePath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: "CONTRIBUTING.md"
            },
            rootDir: ""
        };
    }

    public getGitHubConfig(args: AbstractGeneratorAgent.GitHubConfigArgs<SdkContext>): RawGithubConfig {
        // TODO: get from env
        const githubConfig = this.publishConfig?.type === "github" ? this.publishConfig : undefined;
        return {
            sourceDirectory: "fern/output",
            type: this.publishConfig?.type,
            uri: githubConfig?.uri,
            token: githubConfig?.token,
            branch: (githubConfig as { branch?: string } | undefined)?.branch,
            mode: githubConfig?.mode
        };
    }
}
