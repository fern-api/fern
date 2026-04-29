import { join, RelativeFilePath } from "@fern-api/path-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace MultiUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        multiUrlEnvironments: FernIr.MultipleBaseUrlsEnvironments;
    }
}

export class MultiUrlEnvironmentGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private multiUrlEnvironments: FernIr.MultipleBaseUrlsEnvironments;

    constructor({ context, multiUrlEnvironments }: MultiUrlEnvironmentGenerator.Args) {
        super(context);
        this.multiUrlEnvironments = multiUrlEnvironments;
    }

    public doGenerate(): RubyFile {
        const class_ = ruby.class_({ name: this.context.getEnvironmentsClassReference().name });

        for (const environment of this.multiUrlEnvironments.environments) {
            const urlEntries = this.multiUrlEnvironments.baseUrls
                .map((baseUrl) => {
                    const url = environment.urls[baseUrl.id];
                    if (url == null) {
                        return undefined;
                    }
                    return `${this.case.snakeSafe(baseUrl.name)}: "${url}"`;
                })
                .filter((entry): entry is string => entry != null);

            if (urlEntries.length > 0) {
                class_.addStatement(
                    ruby.codeblock((writer) => {
                        writer.write(
                            `${this.case.screamingSnakeSafe(environment.name)} = { ${urlEntries.join(", ")} }.freeze`
                        );
                    })
                );
            }
        }
        const rootModule = this.context.getRootModule();
        rootModule.addStatement(class_);

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
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
