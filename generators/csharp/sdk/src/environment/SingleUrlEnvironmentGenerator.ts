import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

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
        const class_ = this.csharp.class_({
            ...this.context.getEnvironmentsClassReference(),
            partial: false,
            access: ast.Access.Public,
            annotations: [this.context.getSerializableAttribute()]
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            class_.addField(
                this.csharp.field({
                    access: ast.Access.Public,
                    const_: true,
                    name:
                        (this.context.customConfig["pascal-case-environments"] ?? true)
                            ? environment.name.pascalCase.safeName
                            : environment.name.screamingSnakeCase.safeName,
                    type: this.csharp.Type.string(),
                    initializer: this.csharp.codeblock(this.csharp.string_({ string: environment.url }))
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
