import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<CSharpFile> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.Environments,
            partial: false,
            access: ast.Access.Public,
            annotations: [this.System.Serializable]
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            class_.addField({
                origin: class_.explicit(
                    this.settings.pascalCaseEnvironments
                        ? environment.name.pascalCase.safeName
                        : environment.name.screamingSnakeCase.safeName
                ),

                enclosingType: class_,
                access: ast.Access.Public,
                const_: true,
                type: this.Primitive.string,
                initializer: this.csharp.codeblock(this.csharp.string_({ string: environment.url }))
            });
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getPublicCoreDirectory()),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.Types.Environments.name}.cs`));
    }
}
