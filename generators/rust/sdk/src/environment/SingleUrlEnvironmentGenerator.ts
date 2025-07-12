import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<RustFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): RustFile {
        const enum_ = rust.enum_({
            ...this.context.getEnvironmentsClassReference(),
            backing: "string"
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            enum_.addMember({
                name: this.context.getEnvironmentName(environment.name),
                value: environment.url
            });
        }

        return new RustFile({
            clazz: enum_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.php`)
        );
    }
}
