import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile, php } from "@fern-api/php-codegen";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): PhpFile {
        const enum_ = php.enum_({
            ...this.context.getEnvironmentsClassReference(),
            backing: "string"
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            enum_.addMember({
                name: this.context.getEnvironmentName(environment.name),
                value: environment.url
            });
        }

        return new PhpFile({
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
