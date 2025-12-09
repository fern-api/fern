import { join, RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";

import { MultipleBaseUrlsEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace MultiUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        multiUrlEnvironments: MultipleBaseUrlsEnvironments;
    }
}

export class MultiUrlEnvironmentGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private multiUrlEnvironments: MultipleBaseUrlsEnvironments;

    constructor({ context, multiUrlEnvironments }: MultiUrlEnvironmentGenerator.Args) {
        super(context);
        this.multiUrlEnvironments = multiUrlEnvironments;
    }

    public doGenerate(): RubyFile {
        const class_ = ruby.class_({ name: this.context.getEnvironmentsClassReference().name });

        // Use the first base URL as the default for each environment
        const defaultBaseUrlId = this.multiUrlEnvironments.baseUrls[0]?.id;

        for (const environment of this.multiUrlEnvironments.environments) {
            // Get the URL for the default base URL ID
            const url = defaultBaseUrlId != null ? environment.urls[defaultBaseUrlId] : undefined;
            if (url != null) {
                class_.addStatement(
                    ruby.codeblock((writer) => {
                        writer.write(`${environment.name.screamingSnakeCase.safeName} = "${url}"`);
                    })
                );
            }
        }
        class_.addStatement(
            ruby.codeblock((writer) => {
                writer.newLine();
            })
        );

        const rootModule = this.context.getRootModule();
        rootModule.addStatement(class_);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" });
                writer.newLine();
                rootModule.write(writer);
            }),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getFilename(): string {
        return `${this.context.getEnvironmentsClassReference().name.toLowerCase()}.rb`;
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getRootFolderPath();
    }
}
