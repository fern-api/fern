import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getEnvironmentsClassReference(),
            partial: false,
            access: csharp.Access.Public
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            class_.addField(
                csharp.field({
                    access: csharp.Access.Public,
                    name:
                        (this.context.customConfig["pascal-case-environments"] ?? true)
                            ? environment.name.pascalCase.safeName
                            : environment.name.screamingSnakeCase.safeName,
                    static_: true,
                    type: csharp.Type.string(),
                    initializer: csharp.codeblock(`"${environment.url}"`)
                })
            );
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getPublicCoreDirectory()),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getPublicCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.cs`)
        );
    }
}
