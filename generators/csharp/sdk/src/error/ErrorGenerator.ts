import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

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
        this.classReference = this.context.common.getExceptionClassReference(this.errorDeclaration.name);
    }

    public doGenerate(): CSharpFile {
        const bodyType =
            this.errorDeclaration.type != null
                ? this.context.csharpTypeMapper.convert({ reference: this.errorDeclaration.type })
                : this.csharp.Type.object;
        const class_ = this.csharp.class_({
            reference: this.classReference,
            access: ast.Access.Public,
            parentClassReference: this.types.BaseApiException,
            primaryConstructor: {
                parameters: [this.csharp.parameter({ name: "body", type: bodyType })],
                superClassArguments: [
                    this.csharp.codeblock(`"${this.classReference.name}"`),
                    this.csharp.codeblock(`${this.errorDeclaration.statusCode}`),
                    this.csharp.codeblock("body")
                ]
            },
            summary: "This exception type will be thrown for any non-2XX API responses.",
            annotations: [this.extern.System.Serializable]
        });
        if (this.errorDeclaration.type != null && !is.Type.object(bodyType)) {
            class_.addField({
                origin: class_.explicit("Body"),
                type: bodyType,
                access: ast.Access.Public,
                get: true,
                initializer: this.csharp.codeblock("body"),
                summary: "The body of the response that triggered the exception.",
                new_: true
            });
        }
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForError(this.errorDeclaration.name),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
