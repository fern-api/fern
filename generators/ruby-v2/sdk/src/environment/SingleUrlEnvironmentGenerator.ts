import { join, RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): RubyFile {
        const class_ = ruby.class_({ name: this.context.getEnvironmentsClassReference().name });

        for (const environment of this.singleUrlEnvironments.environments) {
            class_.addStatement(
                ruby.codeblock((writer) => {
                    writer.write(`${environment.name.screamingSnakeCase.safeName} = "${environment.url}"`);
                })
            );
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
