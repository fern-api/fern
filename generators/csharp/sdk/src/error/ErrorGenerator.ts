import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ErrorGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    readonly classReference;

    constructor(
        context: SdkGeneratorContext,
        readonly errorDeclaration: ErrorDeclaration
    ) {
        super(context);
        this.classReference = this.context.getExceptionClassReference(this.errorDeclaration.name);
    }

    public doGenerate(): CSharpFile {
        const bodyType =
            this.errorDeclaration.type != null
                ? this.context.csharpTypeMapper.convert({ reference: this.errorDeclaration.type })
                : csharp.Type.object();
        const class_ = csharp.class_({
            ...this.classReference,
            access: csharp.Access.Public,
            parentClassReference: this.context.getBaseApiExceptionClassReference(),
            primaryConstructor: {
                parameters: [csharp.parameter({ name: "body", type: bodyType })],
                superClassArguments: [
                    csharp.codeblock(`"${this.classReference.name}"`),
                    csharp.codeblock(`${this.errorDeclaration.statusCode}`),
                    csharp.codeblock("body")
                ]
            },
            summary: "This exception type will be thrown for any non-2XX API responses."
        });
        if (this.errorDeclaration.type != null) {
            class_.addField(
                csharp.field({
                    name: "Body",
                    type: bodyType,
                    access: csharp.Access.Public,
                    get: true,
                    initializer: csharp.codeblock("body"),
                    summary: "The body of the response that triggered the exception.",
                    new_: true
                })
            );
        }
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForError(this.errorDeclaration.name),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(`${this.classReference.name}.cs`)
        );
    }
}
